import type { Meta, StoryObj } from "@storybook/react";
import UtilizationCard, { type Utilization } from "./UtilizationCard";

const meta: Meta<typeof UtilizationCard> = {
  title: "Audit/UtilizationCard",
  component: UtilizationCard
};
export default meta;

type Story = StoryObj<typeof UtilizationCard>;

const make = (current: number, target = 10): Utilization => ({ current, target, delta: current - target });

export const Healthy: Story = { args: { title: "Overall", value: make(7) } };
export const Watch: Story = { args: { title: "Overall", value: make(17) } };
export const Risk: Story = { args: { title: "Overall", value: make(35) } };