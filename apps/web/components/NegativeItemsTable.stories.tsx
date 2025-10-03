import type { Meta, StoryObj } from "@storybook/react";
import NegativeItemsTable, { type NegativeItem } from "./NegativeItemsTable";

const meta: Meta<typeof NegativeItemsTable> = {
  title: "Audit/NegativeItemsTable",
  component: NegativeItemsTable
};
export default meta;

type Story = StoryObj<typeof NegativeItemsTable>;

const sample: NegativeItem[] = [
  { id: "1", account: "Capital One", issue: "late_payment", priority: "P2", flags: ["late_payment"], bureauDates: {} },
  { id: "2", account: "Discover", issue: "high_utilization", priority: "P1", flags: ["high_utilization"], bureauDates: {} }
];

export const Default: Story = {
  args: { items: sample }
};