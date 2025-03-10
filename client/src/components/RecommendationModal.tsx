import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  nodeCount: number;
  tags: string[];
}

interface RecommendationModalProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
  recommendations: Template[];
}

const RecommendationModal = ({ open, onClose, onSelectTemplate, recommendations }: RecommendationModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Recommended Templates</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto my-4">
          <p className="mb-4 text-sm text-gray-600">Based on your workflow pattern, you might be interested in these templates:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((template) => (
              <div 
                key={template.id}
                className="border border-gray-200 rounded-lg hover:border-primary cursor-pointer hover:shadow-md transition-all"
                onClick={() => onSelectTemplate(template.id)}
              >
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <div className={cn("w-8 h-8 rounded-md flex items-center justify-center mr-2", {
                      "bg-blue-100 text-blue-600": template.color === "blue",
                      "bg-green-100 text-green-600": template.color === "green",
                      "bg-purple-100 text-purple-600": template.color === "purple",
                      "bg-orange-100 text-orange-600": template.color === "orange",
                    })}>
                      <i className={template.icon}></i>
                    </div>
                    <h4 className="font-medium">{template.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <span>{template.nodeCount} nodes</span>
                    <span className="mx-2">•</span>
                    <span>Includes {template.tags.join(", ")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>
            Continue with Current Workflow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecommendationModal;
