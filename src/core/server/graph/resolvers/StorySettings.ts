import * as story from "coral-server/models/story";

import { GQLStorySettingsTypeResolver } from "../schema/__generated__/types";

import { LiveConfigurationInput } from "./LiveConfiguration";

export interface StorySettingsInput extends story.StorySettings {
  lastCommentedAt?: Date;
  createdAt?: Date;
}

export const StorySettings: GQLStorySettingsTypeResolver<StorySettingsInput> = {
  live: (s): LiveConfigurationInput => ({
    // Live may not be available sometimes, fix it here with the inline ||.
    ...(s.live || { enabled: false }),
    // Pass these options as required by LiveConfigurationInput.
    lastCommentedAt: s.lastCommentedAt,
    createdAt: s.createdAt,
  }),
  moderation: (s, input, ctx) => s.moderation || ctx.tenant.moderation,
  premodLinksEnable: (s, input, ctx) =>
    s.premodLinksEnable || ctx.tenant.premodLinksEnable,
  messageBox: (s) => {
    if (s.messageBox) {
      return s.messageBox;
    }

    return {
      enabled: false,
    };
  },
  // FEATURE_FLAG:ENABLE_QA
  mode: (s, input, ctx) => story.resolveStoryMode(s, ctx.tenant),
  experts: (s, input, ctx) => {
    if (s.expertIDs) {
      return ctx.loaders.Users.user.loadMany(s.expertIDs);
    }

    return [];
  },
};
