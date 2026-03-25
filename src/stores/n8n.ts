import { createGlobalState } from "@vueuse/core";
import { useToast } from "@/components/ui/toast/use-toast";
import type { ChatMessageResponse } from "@/types/chat";

export const useN8n = createGlobalState(() => {
	const { appConfig } = useApp();
	const { toast } = useToast();
	const ASSISTANT_TYPING_TOKEN = "__assistant_typing__";
	const SESSION_STORAGE_KEY = "chat_session_id";

	const messages = ref<{ role: "user" | "assistant"; content: string }[]>([]);
	const userInput = ref("");
	const isLoading = ref(false);
	const selectedLanguage = ref<"cs" | "en" | null>(null);
	const STORAGE_PREFIX = "embedded_chat_state_v1";

	type PersistedChatState = {
		messages: { role: "user" | "assistant"; content: string }[];
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
			selectedLanguage.value = parsed.selectedLanguage === "cs" || parsed.selectedLanguage === "en" ? parsed.selectedLanguage : null;
			userInput.value = typeof parsed.userInput === "string" ? parsed.userInput : "";
			return true;
		} catch {
			return false;
		}
	};

	function getSessionId() {
		return localStorage.getItem("chat_session_id");
	}

	const resetSessionId = () => {
		const newSessionId = crypto.randomUUID();
		localStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
		return newSessionId;
	};

	const ensureSessionId = () => {
		return getSessionId() || resetSessionId();
	};

	const sendMessage = async (chatInput: string) => {
		const messageToSend = chatInput.trim();
		if (messageToSend === "") {
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

		userInput.value = "";
		messages.value.push({ role: "user", content: messageToSend });
		messages.value.push({ role: "assistant", content: ASSISTANT_TYPING_TOKEN });

		isLoading.value = true;

		try {
			const body = {
				chatInput: messageToSend,
				sessionId: ensureSessionId(),
			};

			const response = await fetch(appConfig.value.hostname, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			if (!response.ok) throw new Error(await response.text());
			const answer = (await response.text()).trim();
			if (!answer) throw new Error("Empty response from server");
			messages.value[messages.value.length - 1] = { role: "assistant", content: answer };
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
		userInput.value = "";
		if (appConfig.value.initialMessage && appConfig.value.initialMessage.trim() !== "") {
			messages.value = [{ role: "assistant", content: appConfig.value.initialMessage }];
		} else {
			messages.value = [];
		}
		saveState();
	};

	const chooseLanguage = (language: "cs" | "en") => {
		resetSessionId();
		selectedLanguage.value = language;
		const greeting = language === "cs" ? "Ahoj! Jak vám mohu dnes pomoci?" : "Hi! How can I help you today?";
		messages.value = [{ role: "assistant", content: greeting }];
		saveState();
	};

	const clearChat = () => {
		isLoading.value = false;
		resetSessionId();
		initializeChat(true);
	};

	const clearDraft = () => {
		userInput.value = "";
		saveState();
	};

	watch([messages, userInput, selectedLanguage], () => {
		saveState();
	}, { deep: true });

	return { messages, userInput, sendMessage, isLoading, clearChat, clearDraft, initializeChat, selectedLanguage, chooseLanguage };
});
