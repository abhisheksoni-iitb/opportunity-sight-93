import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to format message content with proper markdown rendering
export const formatMessageContent = (content: string): string => {
  return content
    // Convert ### headers to h3
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-foreground">$1</h3>')
    // Convert ## headers to h2  
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-4 mb-2 text-foreground">$1</h2>')
    // Convert # headers to h1
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-4 mb-3 text-foreground">$1</h1>')
    // Convert **bold** to <strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    // Convert *italic* to <em>
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    // Convert bullet points with - or * to proper list items
    .replace(/^[-*]\s+(.+)$/gm, '<li class="mb-1">$1</li>')
    // Convert numbered lists
    .replace(/^\d+\.\s+(.+)$/gm, '<li class="mb-1">$1</li>')
    // Handle line breaks and paragraphs
    .split('\n\n')
    .map(paragraph => {
      // If paragraph contains list items, wrap in appropriate list
      if (paragraph.includes('<li')) {
        const listItems = paragraph.match(/<li[^>]*>.*?<\/li>/g);
        if (listItems) {
          // Check if it's a bullet list or numbered list by looking at original content
          const isBulletList = paragraph.includes('- ') || paragraph.includes('* ');
          const listClass = isBulletList ? 'list-disc' : 'list-decimal';
          return `<ul class="${listClass} pl-6 space-y-1 mb-4">${listItems.join('')}</ul>`;
        }
      }
      // Regular paragraph
      if (paragraph.trim() && !paragraph.includes('<h') && !paragraph.includes('<ul') && !paragraph.includes('<ol')) {
        return `<p class="mb-3 text-foreground leading-relaxed">${paragraph.trim()}</p>`;
      }
      return paragraph;
    })
    .join('')
    // Clean up extra spacing
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};