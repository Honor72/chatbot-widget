<template>
	<N8nEmbeddedChatInterface
		label="AI Assistant"
		description="Customer support chat"
		:hostname="webhookUrl"
		open-on-start="false"
	/>
</template>

<script setup lang="ts">
import { computed } from "vue";
import N8nEmbeddedChatInterface from "./components/N8nEmbeddedChatInterface.vue";

const webhookUrl = computed(() => import.meta.env.VITE_MAKE_WEBHOOK_URL ?? "");
</script>
