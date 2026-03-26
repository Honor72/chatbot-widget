<template>
	<div class="chat-shell">
		<div class="chat-scroll" id="chat-messages-container">
			<div v-if="messages.length === 0" class="chat-empty-state">
				<p class="chat-empty-title">Vyberte jazyk</p>
				<p class="chat-empty-subtitle-en">Choose language to start</p>
				<div class="mt-5 flex w-full max-w-[320px] gap-3">
					<Button class="flex-1 rounded-full border border-slate-200 bg-white px-5 py-3 text-base font-semibold text-slate-700 hover:bg-slate-100" variant="secondary" @click="chooseLanguage('cs')">
						<FlagCzechia class="h-5 w-5" />
						<span>Čeština</span>
					</Button>
					<Button class="flex-1 rounded-full border border-slate-200 bg-white px-5 py-3 text-base font-semibold text-slate-700 hover:bg-slate-100" variant="secondary" @click="chooseLanguage('en')">
						<FlagUnitedKingdom class="h-5 w-5" />
						<span>English</span>
					</Button>
				</div>
			</div>

			<div v-else class="space-y-3">
				<div v-for="(msg, idx) in messages" :key="idx" class="animate-chat-in">
					<div :class="msg.role === 'user' ? 'justify-end' : 'justify-start'" class="flex">
						<div
							:class="
								msg.role === 'user'
									? 'chat-bubble-user'
									: 'chat-bubble-assistant'
							"
						>
							<span v-if="msg.role === 'user'" class="whitespace-pre-wrap break-words">
								{{ msg.content }}
							</span>
							<Thinking v-else-if="msg.content === ASSISTANT_TYPING_TOKEN || msg.content === 'Thinking...'" size="large" />
							<Renderer v-else :content="msg.content" />
						</div>
					</div>
				</div>
			</div>
		</div>

			<div v-if="selectedLanguage" class="chat-input-wrap">
				<div :class="{ 'chat-input-focus': focused }" class="chat-input-frame">
					<Textarea
						v-if="!isLoading"
						v-model="userInput"
						:disabled="isLoading"
						:maxlength="MAX_MESSAGE_LENGTH"
						:class="focused ? 'h-[84px]' : 'h-[40px]'"
						class="resize-none transition-all duration-200"
						:placeholder="placeholderText"
						@click="focused = true"
						@blur="focused = false"
						@keydown.enter.exact.prevent="submitMessage"
					/>

					<div class="flex justify-end px-1 pb-1">
						<span class="text-[11px] text-slate-600 opacity-60">{{ characterCounter }}</span>
					</div>

					<div class="flex items-center justify-between px-1 pb-1">
						<div class="flex items-center gap-2">
							<div class="tooltip-trigger">
								<Button
									:disabled="isLoading"
									class="size-8 rounded-full border border-slate-200 bg-white p-0 text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-100"
									variant="secondary"
									:aria-label="newChatTooltip"
									@click="clearChat"
								>
									<RefreshIcon class="text-lg" />
								</Button>
								<span class="tooltip-bubble">{{ newChatTooltip }}</span>
							</div>

							<div class="tooltip-trigger">
								<Button
									:disabled="isLoading"
									class="size-8 rounded-full border border-slate-200 bg-white p-0 text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-100"
									variant="secondary"
									:aria-label="eraseTooltip"
									@click="clearDraft"
								>
									<FluentErase24Regular class="text-lg" />
								</Button>
								<span class="tooltip-bubble">{{ eraseTooltip }}</span>
							</div>
						</div>

						<div class="flex items-center gap-2">
							<div class="tooltip-trigger">
								<Button
									:disabled="isLoading"
									class="size-9 rounded-full bg-gradient-to-r from-slate-900 to-slate-700 p-0 text-white shadow-lg transition-transform hover:scale-[1.03]"
									:aria-label="sendTooltip"
									@click="submitMessage"
								>
									<PaperPlaneIcon class="text-lg" />
								</Button>
								<span class="tooltip-bubble tooltip-bubble-right">{{ sendTooltip }}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import PaperPlaneIcon from "~icons/fluent/send-24-regular";
import RefreshIcon from "~icons/material-symbols/refresh-rounded";
import FluentErase24Regular from "~icons/fluent/eraser-24-regular";
import FlagCzechia from "~icons/twemoji/flag-czechia";
import FlagUnitedKingdom from "~icons/twemoji/flag-united-kingdom";
import Thinking from "@/components/Thinking.vue";
import Renderer from "@/components/markdown/Renderer.vue";
import { useN8n } from "@/stores/n8n";

const { messages, userInput, sendMessage, isLoading, clearChat, clearDraft, initializeChat, selectedLanguage, chooseLanguage } = useN8n();
const ASSISTANT_TYPING_TOKEN = "__assistant_typing__";
const MAX_MESSAGE_LENGTH = 100;
const focused = ref(false);
const placeholderText = computed(() => (selectedLanguage.value === "cs" ? "Napište zprávu..." : "Ask anything..."));
const eraseTooltip = computed(() => (selectedLanguage.value === "cs" ? "Vymazat chat" : "Clear chat"));
const sendTooltip = computed(() => (selectedLanguage.value === "cs" ? "Odeslat zprávu" : "Send message"));
const newChatTooltip = computed(() => (selectedLanguage.value === "cs" ? "Nový chat" : "New chat"));
const characterCounter = computed(() => `${String(userInput.value?.length ?? 0)} / ${MAX_MESSAGE_LENGTH}`);
const submitMessage = () => {
	const text = userInput.value;
	userInput.value = "";
	void sendMessage(text);
};

onMounted(() => {
	initializeChat();
});
</script>

<style scoped>
.chat-shell {
	display: grid;
	grid-template-rows: minmax(0, 1fr) auto;
	height: 100%;
	background:
		radial-gradient(circle at top right, rgba(226, 232, 240, 0.7), transparent 45%),
		linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.chat-scroll {
	min-height: 0;
	overflow-y: auto;
	padding: 14px 12px 12px;
}

.chat-empty-state {
	display: flex;
	height: 100%;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
	color: #475569;
}

.chat-empty-title {
	margin-top: 8px;
	font-size: 1.04rem;
	opacity: 0.72;
	font-weight: 500;
}

.chat-empty-subtitle-en {
	margin-top: 8px;
	font-size: 1.04rem;
	opacity: 0.72;
}

.chat-bubble-user {
	max-width: 82%;
	border-radius: 22px 22px 6px 22px;
	background: linear-gradient(135deg, #0f172a, #334155);
	padding: 10px 12px;
	color: #fff;
	font-size: 0.92rem;
	box-shadow: 0 8px 20px rgba(15, 23, 42, 0.25);
}

.chat-bubble-assistant {
	max-width: 82%;
	border-radius: 22px 22px 22px 6px;
	border: 1px solid rgba(148, 163, 184, 0.25);
	background: rgba(255, 255, 255, 0.88);
	padding: 10px 12px;
	font-size: 0.92rem;
	color: #0f172a;
	box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
	backdrop-filter: blur(8px);
}

.chat-input-wrap {
	padding: 8px 10px 10px;
	background: linear-gradient(180deg, rgba(248, 250, 252, 0) 0%, rgba(248, 250, 252, 0.95) 35%);
}

.chat-input-frame {
	border: 1px solid rgba(148, 163, 184, 0.35);
	border-radius: 18px;
	background: rgba(255, 255, 255, 0.78);
	padding: 8px;
	backdrop-filter: blur(8px);
	transition: border-color 180ms ease, box-shadow 180ms ease;
}

.chat-input-focus {
	border-color: rgba(51, 65, 85, 0.45);
	box-shadow: 0 0 0 4px rgba(148, 163, 184, 0.15);
}

.tooltip-trigger {
	position: relative;
	display: inline-flex;
}

.tooltip-bubble {
	position: absolute;
	left: 50%;
	bottom: calc(100% + 8px);
	transform: translateX(-50%) translateY(2px);
	border-radius: 8px;
	background: #0f172a;
	color: #f8fafc;
	font-size: 11px;
	line-height: 1;
	padding: 7px 8px;
	white-space: nowrap;
	pointer-events: none;
	opacity: 0;
	transition: opacity 120ms ease, transform 120ms ease;
	transition-delay: 180ms;
	z-index: 20;
}

.tooltip-bubble-right {
	left: auto;
	right: 0;
	transform: translateX(0) translateY(2px);
}

.tooltip-trigger:hover .tooltip-bubble,
.tooltip-trigger:focus-within .tooltip-bubble {
	opacity: 1;
	transform: translateX(-50%) translateY(0);
}

.tooltip-trigger:hover .tooltip-bubble-right,
.tooltip-trigger:focus-within .tooltip-bubble-right {
	transform: translateX(0) translateY(0);
}
</style>
