import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <motion.div 
      className="bg-card rounded-xl p-6 shadow-sm border hover:shadow-md transition-all duration-300 h-full"
      whileHover={{ y: -5, borderColor: "var(--primary)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.div 
        className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4"
        whileHover={{ scale: 1.05, backgroundColor: "rgba(var(--primary), 0.2)" }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          whileHover={{ rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          <Icon className="h-6 w-6 text-primary" />
        </motion.div>
      </motion.div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
};

export default FeatureCard;
