interface AccountPayload {
	id: number;
	thumb: string;
	title: string;
}
interface ServerPayload {
	title: string;
	uuid: string;
}
interface PlayerPayload {
	local: boolean;
	publicAddress: string;
	title: string;
	uuid: string;
}
interface GuidPayload {
	id: string;
}
interface MetadataPayload {
	librarySectionType: string;
	ratingKey: string;
	key: string;
	parentRatingKey: string;
	grandparentRatingKey: string;
	Guid?: GuidPayload[];
	parentGuid: string;
	grandparentGuid: string;
	parentStudio: string;
	type: string;
	title: string;
	grandparentKey: string;
	parentKey: string;
	librarySectionTitle: string;
	librarySectionID: number;
	librarySectionKey: string;
	grandparentTitle: string;
	parentTitle: string;
	summary: string;
	index: number;
	parentIndex: number;
	ratingCount: number;
	parentYear: number;
	thumb: string;
	art: string;
	parentThumb: string;
	grandparentThumb: string;
	grandparentArt: string;
	addedAt: number;
	updatedAt: number;
	musicAnalysisVersion: string;
	originalTitle?: string;
}
export default interface Payload {
	event: string;
	user: boolean;
	owner: boolean;
	Account: AccountPayload;
	Server: ServerPayload;
	Player: PlayerPayload;
	Metadata: MetadataPayload;
}
