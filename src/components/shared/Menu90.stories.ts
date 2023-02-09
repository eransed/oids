import type { Meta, StoryObj } from "@storybook/svelte";
import type { Button90Config } from "../interface";
import Menu90__SvelteComponent_ from "./menu/Menu90.svelte";

const TestButton1: Button90Config = {
  buttonText: "Button 1",
  clickCallback: () => alert("Button 1"),
  selected: false,
};

const TestButton2: Button90Config = {
  buttonText: "Button 2",
  clickCallback: () => alert("Button 2"),
  selected: false,
};

const Buttons: Button90Config[] = [TestButton1, TestButton2];

const meta = {
  title: "Menu90",
  component: Menu90__SvelteComponent_,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/7.0/react/writing-docs/docs-page

  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/7.0/svelte/configure/story-layout
    layout: "fullscreen",
  },
} satisfies Meta<Menu90__SvelteComponent_>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Title: Story = {
  args: {
    menuOpen: true,
    buttons: Buttons,
  },
};
