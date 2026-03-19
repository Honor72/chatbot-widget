import { createApp } from "vue";
import N8nEmbeddedChatInterface from "./components/N8nEmbeddedChatInterface.vue";
import i18n from "./i18n";
import { useCustomColors, type ColorProps } from "./composables/useCustomColors";
import baseStyles from "./styles/output.css?inline";
import widgetScopedFallbackStyles from "./styles/widget-scoped-fallback.css?inline";

class N8nEmbeddedChatInterfaceElement extends HTMLElement {
	connectedCallback() {
		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open" });
		}
		const mountPoint = document.createElement("div");
		if (this.shadowRoot) {
			this.shadowRoot.appendChild(mountPoint);
		}

		// Read attributes and pass them as props
		const props: Record<string, any> = {};
		for (const attr of this.getAttributeNames()) {
			// Convert dash-case attribute names to camelCase
			const camelCase = attr.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
			props[camelCase] = this.getAttribute(attr);
		}

		const app = createApp(N8nEmbeddedChatInterface, props);
		app.use(i18n);
		app.mount(mountPoint);
	}

	// Generate custom color CSS based on attributes using the secure composable
	protected generateCustomColorCSS(): string {
		const colorProps: ColorProps = {
			primaryColor: this.getAttribute('primary-color') || undefined,
			secondaryColor: this.getAttribute('secondary-color') || undefined,
			backgroundColor: this.getAttribute('background-color') || undefined,
			textColor: this.getAttribute('text-color') || undefined,
			accentColor: this.getAttribute('accent-color') || undefined,
			surfaceColor: this.getAttribute('surface-color') || undefined,
			borderColor: this.getAttribute('border-color') || undefined,
			successColor: this.getAttribute('success-color') || undefined,
			warningColor: this.getAttribute('warning-color') || undefined,
			errorColor: this.getAttribute('error-color') || undefined
		};

		const { generateCustomColorCSS } = useCustomColors(colorProps);
		return generateCustomColorCSS();
	}
}

const registerCustomElements = (css = "") => {
	class N8nEmbeddedChatInterfaceElementWithStyles extends N8nEmbeddedChatInterfaceElement {
		connectedCallback() {
			super.connectedCallback();
			if (!css || !this.shadowRoot) return;

			try {
				const styleTag = document.createElement("style");
				styleTag.textContent = css + this.generateCustomColorCSS();
				this.shadowRoot.appendChild(styleTag);
			} catch (error) {
				console.warn("Failed to inject custom colors:", error);
				try {
					const fallbackStyleTag = document.createElement("style");
					fallbackStyleTag.textContent = css;
					this.shadowRoot.appendChild(fallbackStyleTag);
				} catch (fallbackError) {
					console.error("Critical error: Failed to inject any styles:", fallbackError);
				}
			}
		}
	}

	if (!customElements.get("embedded-chat-interface")) {
		customElements.define("embedded-chat-interface", N8nEmbeddedChatInterfaceElementWithStyles);
	}
	if (!customElements.get("n8n-embedded-chat-interface")) {
		customElements.define("n8n-embedded-chat-interface", N8nEmbeddedChatInterfaceElementWithStyles);
	}
};

const embeddedStyles = `${baseStyles}\n${widgetScopedFallbackStyles}`;
registerCustomElements(embeddedStyles);
