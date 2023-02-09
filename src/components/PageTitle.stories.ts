import type { Meta, StoryObj } from "@storybook/svelte";
import PageTitle__SvelteComponent_ from "./shared/PageTitle.svelte";

const meta = {
  title: "PageTitle",
  component: PageTitle__SvelteComponent_,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/7.0/react/writing-docs/docs-page
  tags: ["autodocs"],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/7.0/svelte/configure/story-layout
    layout: "fullscreen",
  },
} satisfies Meta<PageTitle__SvelteComponent_>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Title: Story = {
  args: {
    title: "Test",
  },
};
