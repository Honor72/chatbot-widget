import { createGlobalState } from "@vueuse/core";
import { useToast } from "@/components/ui/toast/use-toast";
import type { ChatMessageResponse } from "@/types/chat";

export const useN8n = createGlobalState(() => {
	const { appConfig } = useApp();
	const { toast } = useToast();

	const messages = ref<{ role: "user" | "assistant"; content: string }[]>([]);
	const userInput = ref("");
	const isLoading = ref(false);
	const sessionId = ref<string | null>(null);
	const selectedLanguage = ref<"cs" | "en" | null>(null);
	const STORAGE_PREFIX = "embedded_chat_state_v1";

	type PersistedChatState = {
		messages: { role: "user" | "assistant"; content: string }[];
		sessionId: string | null;
		selectedLanguage: "cs" | "en" | null;
		userInput: string;
	};

	const getStorageKey = () => {
		const scope = appConfig.value.hostname?.trim() || "default";
		return `${STORAGE_PREFIX}:${scope}`;
	};

	const saveState = () => {
		try {
			const payload: PersistedChatState = {
				messages: messages.value,
				sessionId: sessionId.value,
				selectedLanguage: selectedLanguage.value,
				userInput: userInput.value,
			};
			localStorage.setItem(getStorageKey(), JSON.stringify(payload));
		} catch {
			// No-op: storage can be unavailable in strict browser contexts.
		}
	};

	const clearPersistedState = () => {
		try {
			localStorage.removeItem(getStorageKey());
		} catch {
			// Ignore storage errors.
		}
	};

	const loadState = (): boolean => {
		try {
			const raw = localStorage.getItem(getStorageKey());
			if (!raw) return false;

			const parsed = JSON.parse(raw) as Partial<PersistedChatState>;
			if (!parsed || !Array.isArray(parsed.messages)) return false;

			messages.value = parsed.messages.filter((item) => typeof item?.content === "string" && (item.role === "user" || item.role === "assistant"));
			sessionId.value = typeof parsed.sessionId === "string" ? parsed.sessionId : null;
			selectedLanguage.value = parsed.selectedLanguage === "cs" || parsed.selectedLanguage === "en" ? parsed.selectedLanguage : null;
			userInput.value = typeof parsed.userInput === "string" ? parsed.userInput : "";
			return true;
		} catch {
			return false;
		}
	};

	const extractAssistantMessage = (data: unknown): string => {
		if (typeof data === "string") return data;

		if (Array.isArray(data) && data.length > 0) {
			return extractAssistantMessage(data[0]);
		}

		if (data && typeof data === "object") {
			const payload = data as ChatMessageResponse;
			if (typeof payload.output === "string") return payload.output;
			if (typeof payload.reply === "string") return payload.reply;
			if (typeof payload.message === "string") return payload.message;
			if (typeof payload.text === "string") return payload.text;
		}

		return "Thanks! Your message was received.";
	};

	const extractSessionId = (data: unknown): string | null => {
		if (!data || typeof data !== "object") return null;
		const payload = data as ChatMessageResponse;
		return payload.sessionId ?? payload.sessionID ?? payload.session_id ?? null;
	};

	const sendMessage = async (chatInput: string) => {
		if (chatInput.trim() === "") {
			userInput.value = "";
			toast({ title: "Please enter a message" });
			return;
		}

		if (!selectedLanguage.value) {
			toast({ title: "Please choose a language first" });
			return;
		}

		if (!appConfig.value.hostname) {
			toast({ title: "Webhook URL is missing", variant: "destructive" });
			return;
		}

		messages.value.push({ role: "user", content: chatInput });
		messages.value.push({ role: "assistant", content: "Thinking..." });

		isLoading.value = true;

		try {
			const body: Record<string, any> = { chatInput };
			if (sessionId.value) body.sessionId = sessionId.value;
			body.language = selectedLanguage.value;

			const response = await fetch(appConfig.value.hostname, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			if (!response.ok) throw new Error(await response.text());
			const data: unknown = await response.json();
			const answer = extractAssistantMessage(data);
			const parsedSessionId = extractSessionId(data);
			if (parsedSessionId) sessionId.value = parsedSessionId;
			messages.value[messages.value.length - 1] = { role: "assistant", content: answer };
			userInput.value = "";
			saveState();
		} catch (error) {
			messages.value[messages.value.length - 1] = { role: "assistant", content: "Error: " + (error as any).message };
			toast({ title: "Request failed", variant: "destructive" });
			saveState();
		} finally {
			isLoading.value = false;
		}
	};

	const initializeChat = (forceReset = false) => {
		if (!forceReset && loadState()) return;

		if (forceReset) {
			clearPersistedState();
		}

		selectedLanguage.value = null;
		sessionId.value = null;
		userInput.value = "";
		if (appConfig.value.initialMessage && appConfig.value.initialMessage.trim() !== "") {
			messages.value = [{ role: "assistant", content: appConfig.value.initialMessage }];
		} else {
			messages.value = [];
		}
		saveState();
	};

	const chooseLanguage = (language: "cs" | "en") => {
		selectedLanguage.value = language;
		const greeting = language === "cs" ? "Ahoj! Jak vám mohu dnes pomoci?" : "Hi! How can I help you today?";
		messages.value = [{ role: "assistant", content: greeting }];
		saveState();
	};

	const clearChat = () => {
		isLoading.value = false;
		initializeChat(true);
	};

	const clearDraft = () => {
		userInput.value = "";
		saveState();
	};

	watch([messages, userInput, selectedLanguage, sessionId], () => {
		saveState();
	}, { deep: true });

	return { messages, userInput, sendMessage, isLoading, clearChat, clearDraft, initializeChat, selectedLanguage, chooseLanguage };
});
