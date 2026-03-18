export type ChatMessageResponse = {
	sessionId?: string;
	sessionID?: string;
	session_id?: string;
	output?: string;
	reply?: string;
	message?: string;
	text?: string;
};

export interface optionButton {
	icon: any;
	command: () => void;
	disabled: boolean;
	active?: boolean;
	show?: boolean;
	class?: string;
}
