import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TestimonialCardProps {
  quote: string;
  author: string;
  image: string;
  location?: string;
}

// Helper function to format testimonial text with bold sections
const formatTestimonial = (text: string) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, index) => 
    index % 2 === 1 ? 
      <strong key={index} className="font-semibold text-foreground">{part}</strong> : 
      part
  );
};

const TestimonialCard = ({ quote, author, image, location }: TestimonialCardProps) => {
  return (
    <motion.div 
      className="bg-white rounded-xl p-6 shadow-md border border-primary/10 hover:border-primary/20 hover:shadow-lg transition-all duration-300 flex flex-col h-full"
      whileHover={{ 
        y: -5,
        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <div className="flex-1">
        <motion.svg 
          className="h-8 w-8 text-primary/20 mb-4" 
          fill="currentColor" 
          viewBox="0 0 32 32"
          initial={{ opacity: 0.5, scale: 1 }}
          whileHover={{ 
            opacity: 0.8, 
            scale: 1.1, 
            rotate: 5,
            color: "var(--primary)" 
          }}
          transition={{ duration: 0.3 }}
        >
          <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
        </motion.svg>
        <p className="text-card-foreground italic mb-4 leading-relaxed">
          {formatTestimonial(quote)}
        </p>
      </div>
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
        <motion.div 
          className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary/10"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <img 
            src={image} 
            alt={author} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </motion.div>
        <div>
          <motion.div 
            className="font-medium text-foreground"
            initial={{ opacity: 1 }}
            whileHover={{ color: "var(--primary)" }}
            transition={{ duration: 0.2 }}
          >
            {author}
          </motion.div>
          {location && <div className="text-sm text-muted-foreground">{location}</div>}
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;
