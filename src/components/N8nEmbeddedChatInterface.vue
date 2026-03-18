<template>
	<div class="pointer-events-none fixed bottom-5 right-5 z-50">
		<transition name="chat-pop">
			<div
				v-if="show"
				class="chat-panel pointer-events-auto h-[min(72vh,620px)] w-[min(92vw,390px)] overflow-hidden rounded-[24px] border border-white/40 bg-white/90 shadow-main-ui backdrop-blur-xl"
			>
				<div class="relative flex h-14 cursor-pointer items-center border-b border-slate-200/70 bg-gradient-to-r from-slate-900 to-slate-700 px-4" @click="show = false" title="Minimize chat">
					<div class="flex items-center gap-3">
						<span class="relative flex size-8 items-center justify-center rounded-full bg-white/15 text-white">
							<SupportAgent class="size-5" />
							<span class="online-dot-header" aria-hidden="true"></span>
						</span>
						<div class="leading-tight">
							<h1 class="text-sm font-semibold text-white">{{ appConfig.label || "Chat Assistant" }}</h1>
							<p class="text-[11px] text-slate-200">{{ appConfig.description || "Online now" }}</p>
						</div>
					</div>
				</div>

				<div class="h-[calc(100%-56px)]">
					<ChatN8n />
				</div>
			</div>
		</transition>

		<button class="chat-fab pointer-events-auto" @click="show = !show" aria-label="Toggle chat">
			<Close v-if="show" class="size-7 text-white" />
			<SupportAgent v-else class="size-7 text-white" />
			<span v-if="!show" class="online-dot" aria-hidden="true"></span>
		</button>
	</div>

	<Toaster />
</template>

<script setup lang="ts">
import { onBeforeMount } from "vue";
import Toaster from "@/components/ui/toast/Toaster.vue";
import SupportAgent from "~icons/material-symbols/support-agent-rounded";
import Close from "~icons/material-symbols/close-rounded";
import ChatN8n from "@/components/chat/n8n/Index.vue";
import { useApp } from "@/stores/App";

const { show, appConfig } = useApp();

const props = defineProps({
	label: String,
	description: String,
	token: String,
	organisationId: String,
	assistant: String,
	hostname: String,
	mode: String,
	openOnStart: String,
	initialMessage: String,
	primaryColor: String,
	secondaryColor: String,
	backgroundColor: String,
	textColor: String,
	accentColor: String,
	surfaceColor: String,
	borderColor: String,
	successColor: String,
	warningColor: String,
	errorColor: String,
});

onBeforeMount(() => {
	show.value = props.openOnStart === "true";
	appConfig.value = {
		label: props.label ?? "",
		description: props.description ?? "",
		hostname: props.hostname ?? "",
		mode: props.mode ?? "",
		initialMessage: props.initialMessage ?? "",
	};
});
</script>

<style scoped>
.chat-fab {
	position: relative;
	display: flex;
	height: 58px;
	width: 58px;
	align-items: center;
	justify-content: center;
	border-radius: 9999px;
	background: linear-gradient(135deg, #0f172a, #334155);
	box-shadow:
		0 16px 30px rgba(15, 23, 42, 0.3),
		0 0 0 1px rgba(255, 255, 255, 0.12) inset;
	transition:
		transform 160ms ease,
		box-shadow 240ms ease;
	z-index: 10;
}

.chat-fab:hover {
	transform: translateY(-1px) scale(1.02);
	box-shadow:
		0 20px 40px rgba(15, 23, 42, 0.35),
		0 0 0 1px rgba(255, 255, 255, 0.18) inset;
}

.chat-panel {
	position: absolute;
	right: 0;
	bottom: 74px;
}

.online-dot {
	position: absolute;
	right: 2px;
	bottom: 2px;
	width: 12px;
	height: 12px;
	border-radius: 9999px;
	background: #22c55e;
	border: 2px solid #ffffff;
	box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6);
	animation: online-breathe 1.9s ease-in-out infinite;
}

.online-dot-header {
	position: absolute;
	right: -1px;
	bottom: -1px;
	width: 9px;
	height: 9px;
	border-radius: 9999px;
	background: #22c55e;
	border: 2px solid #0f172a;
	box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.55);
	animation: online-breathe 1.9s ease-in-out infinite;
}

.chat-pop-enter-active,
.chat-pop-leave-active {
	transition: all 220ms cubic-bezier(0.21, 1.02, 0.73, 1);
}

.chat-pop-enter-from,
.chat-pop-leave-to {
	transform: translateY(10px) scale(0.98);
	opacity: 0;
}

@keyframes online-breathe {
	0% {
		box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.55);
	}
	70% {
		box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
	}
	100% {
		box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
	}
}
</style>
