import { createGlobalState } from "@vueuse/core";

export const useApp = createGlobalState(() => {
	const show = ref(true);
	const appConfig = ref({
		label: "",
		description: "",
		hostname: "",
		mode: "",
		initialMessage: "",
	});
	return { show, appConfig };
});
