import type { Meta, StoryObj } from "@storybook/svelte";
import Modal__SvelteComponent_ from "./Modal.svelte";

const meta = {
  title: "Modal",
  component: Modal__SvelteComponent_,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/7.0/react/writing-docs/docs-page
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/7.0/svelte/configure/story-layout
    layout: "fullscreen",
  },
} satisfies Meta<Modal__SvelteComponent_>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Title: Story = {
  args: {
    title: "Test",
    closeBtn: true,
    showModal: true,
    isEditable: true,
  },
};
