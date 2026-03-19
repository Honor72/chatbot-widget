<template>
	<div :class="[`size-${size}`]" class="thinking-chip-wrapper">
		<span class="thinking-chip" aria-label="Assistant is typing">
			<span class="dot dot-1"></span>
			<span class="dot dot-2"></span>
			<span class="dot dot-3"></span>
		</span>
	</div>
</template>

<script setup lang="ts">
withDefaults(
	defineProps<{
		size?: "small" | "large";
	}>(),
	{
		size: "small",
	},
);
</script>

<style scoped>
.thinking-chip-wrapper {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
}

.thinking-chip {
	display: inline-flex;
	gap: 4px;
	padding: 8px 10px;
	border-radius: 9999px;
	background: rgba(255, 255, 255, 0.8);
	border: 1px solid rgba(148, 163, 184, 0.3);
	backdrop-filter: blur(8px);
}

.dot {
	width: 6px;
	height: 6px;
	border-radius: 9999px;
	background: #334155;
	animation: thinking-bounce 1.1s ease-in-out infinite;
}

.dot-2 {
	animation-delay: 0.12s;
}

.dot-3 {
	animation-delay: 0.24s;
}

.size-large .thinking-chip {
	gap: 8px;
	padding: 10px 14px;
}

.size-large .dot {
	width: 10px;
	height: 10px;
	animation-duration: 1s;
}

@keyframes thinking-bounce {
	0%,
	80%,
	100% {
		transform: translateY(0);
		opacity: 0.4;
	}
	40% {
		transform: translateY(-4px);
		opacity: 1;
	}
}
</style>
