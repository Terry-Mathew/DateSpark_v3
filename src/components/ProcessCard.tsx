import { LucideIcon } from "lucide-react";

const ProcessCard = ({ 
  icon: Icon, 
  title, 
  description, 
  iconPosition = 'left' 
}: { 
  icon: LucideIcon;
  title: string;
  description: string;
  iconPosition?: 'left' | 'right';
}) => (
  <div className="p-4 md:p-6 bg-gray-50/50 rounded-xl border border-gray-100 
  hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow">
    <div className={`flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6 
    ${iconPosition === 'right' ? 'sm:flex-row-reverse' : 'sm:flex-row'}`}>
      <div className="flex-shrink-0">
        <div className="p-3 md:p-4 rounded-xl bg-white shadow-sm border border-gray-100">
          <Icon className="h-6 w-6 md:h-8 md:w-8 text-primary" />
        </div>
      </div>
      <div className={`flex-1 text-center sm:text-left 
      ${iconPosition === 'right' ? 'sm:text-right' : 'sm:text-left'}`}>
        <h3 className="text-lg md:text-xl font-semibold mb-2 text-foreground">{title}</h3>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  </div>
);

export default ProcessCard; 