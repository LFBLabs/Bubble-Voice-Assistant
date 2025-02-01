import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Plan } from "@/utils/plan-config";

interface PlanOptionProps {
  plan: Plan;
}

export const PlanOption = ({ plan }: PlanOptionProps) => {
  return (
    <div className="flex items-center space-x-4 border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
      <RadioGroupItem value={plan.type} id={plan.type} />
      <Label htmlFor={plan.type} className="flex-1 cursor-pointer">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-medium">{plan.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {plan.description}
            </div>
            <ul className="mt-2 space-y-1">
              {plan.features.map((feature, index) => (
                <li key={index} className="text-sm text-gray-600 dark:text-gray-300">
                  • {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className="text-lg font-semibold">${plan.price}</div>
        </div>
      </Label>
    </div>
  );
};