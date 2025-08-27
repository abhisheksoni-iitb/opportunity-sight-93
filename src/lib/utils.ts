import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to format message content with proper markdown rendering
export const formatMessageContent = (content: string): string => {
  return content
    // Convert **bold** to <strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convert *italic* to <em>
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Convert bullet points with * to proper list items
    .replace(/^\*\s+(.+)$/gm, '<li>$1</li>')
    // Wrap consecutive list items in <ul>
    .replace(/(<li>.*<\/li>)/gs, (match) => {
      const items = match.split('</li>').filter(item => item.trim()).map(item => item + '</li>');
      return '<ul class="list-disc pl-4 space-y-1">' + items.join('') + '</ul>';
    })
    // Convert numbered lists
    .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
    // Wrap consecutive numbered list items in <ol>
    .replace(/(<li>.*<\/li>)/gs, (match, p1, offset, string) => {
      // Check if this is part of a numbered list by looking at the original content
      const beforeMatch = string.substring(0, offset);
      const afterMatch = string.substring(offset + match.length);
      if (beforeMatch.match(/\d+\.\s+/) || afterMatch.match(/^\d+\.\s+/m)) {
        return '<ol class="list-decimal pl-4 space-y-1">' + match + '</ol>';
      }
      return match;
    })
    // Convert line breaks to <br> for better formatting
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    // Wrap in paragraph tags
    .replace(/^(.+)/, '<p>$1')
    .replace(/(.+)$/, '$1</p>')
    // Clean up any double paragraph tags
    .replace(/<\/p><p>/g, '</p><p>')
    // Fix list formatting issues
    .replace(/<p>(<[uo]l)/g, '$1')
    .replace(/(<\/[uo]l>)<\/p>/g, '$1');
};