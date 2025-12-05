import React from 'react';
interface SharedContent {
    title?: string;
    text?: string;
    url?: string;
    files?: File[];
}
interface ShareTargetHandlerProps {
    onSharedContent?: (content: SharedContent) => void;
}
export declare const ShareTargetHandler: React.FC<ShareTargetHandlerProps>;
export default ShareTargetHandler;
//# sourceMappingURL=ShareTargetHandler.d.ts.map