import type { Meta, StoryObj } from "@storybook/svelte";
import CountDown__SvelteComponent_ from "./CountDown.svelte";

const meta = {
  title: "CountDown",
  component: CountDown__SvelteComponent_,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/7.0/react/writing-docs/docs-page
  tags: ["autodocs"],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/7.0/svelte/configure/story-layout
    layout: "fullscreen",
  },
} satisfies Meta<CountDown__SvelteComponent_>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CountDown: Story = {
  args: {
    countFrom: 15,
    countDownCallBack() {
      alert("Countdown finished");
    },
  },
};
