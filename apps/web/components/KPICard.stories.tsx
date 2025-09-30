import type { Meta, StoryObj } from "@storybook/react";
import KPICard from "./KPICard";

const meta: Meta<typeof KPICard> = {
  title: "Audit/KPICard",
  component: KPICard
};
export default meta;

type Story = StoryObj<typeof KPICard>;

export const Default: Story = {
  args: { label: "TransUnion", value: 700 }
};