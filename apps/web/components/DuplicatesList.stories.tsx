import type { Meta, StoryObj } from "@storybook/react";
import DuplicatesList, { type Duplicate } from "./DuplicatesList";

const meta: Meta<typeof DuplicatesList> = {
  title: "Audit/DuplicatesList",
  component: DuplicatesList
};
export default meta;

type Story = StoryObj<typeof DuplicatesList>;

const sample: Duplicate[] = [
  { description: "Capital One appears on multiple bureaus", bureaus: ["TU", "EX"] },
  { description: "Discover appears on multiple bureaus", bureaus: ["TU", "EQ"] }
];

export const Default: Story = { args: { items: sample } };
export const Empty: Story = { args: { items: [] } };