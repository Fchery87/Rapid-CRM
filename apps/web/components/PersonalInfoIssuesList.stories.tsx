import type { Meta, StoryObj } from "@storybook/react";
import PersonalInfoIssuesList, { type PersonalIssue } from "./PersonalInfoIssuesList";

const meta: Meta<typeof PersonalInfoIssuesList> = {
  title: "Audit/PersonalInfoIssuesList",
  component: PersonalInfoIssuesList
};
export default meta;

type Story = StoryObj<typeof PersonalInfoIssuesList>;

const sample: PersonalIssue[] = [
  { field: "name", value: "Alex Q Doe", risk: "medium" },
  { field: "addressLine", value: "125 Main St", risk: "medium" },
  { field: "ssnLast4", value: "1234", risk: "high" }
];

export const Default: Story = {
  args: { items: sample }
};

export const Empty: Story = {
  args: { items: [] }
};