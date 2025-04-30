/**
 * Simple Markdown to HTML converter
 * 
 * This is a basic converter that handles the most common Markdown syntax.
 * For a more robust solution, consider using a library like marked.js, showdown.js, or similar.
 */

class MarkdownConverter {
    constructor() {
        // Regular expressions for different Markdown elements
        this.rules = {
            // Headers
            h1: /^# (.*$)/gm,
            h2: /^## (.*$)/gm,
            h3: /^### (.*$)/gm,
            h4: /^#### (.*$)/gm,
            h5: /^##### (.*$)/gm,
            h6: /^###### (.*$)/gm,
            
            // Bold, italic, and links
            bold: /\*\*(.*?)\*\*/gm,
            italic: /\*(.*?)\*/gm,
            link: /\[(.*?)\]\((.*?)\)/gm,
            
            // Lists
            ul: /^\* (.*$)/gm,
            ol: /^\d+\. (.*$)/gm,
            
            // Code blocks
            codeBlock: /```([a-z]*)\n([\s\S]*?)```/gm,
            inlineCode: /`(.*?)`/gm,
            
            // Blockquotes
            blockquote: /^> (.*$)/gm,
            
            // Horizontal rule
            hr: /^---$/gm,
            
            // Paragraphs (needs special handling)
            paragraphs: /\n\n+/g
        };
    }
    
    /**
     * Convert Markdown string to HTML
     * @param {string} markdownText - The markdown text to convert
     * @return {string} The converted HTML
     */
    convertToHtml(markdownText) {
        let html = markdownText;
        
        // Process code blocks first to avoid conflicts
        html = html.replace(this.rules.codeBlock, (match, language, code) => {
            return `<pre><code class="language-${language}">${this._escapeHtml(code.trim())}</code></pre>`;
        });
        
        // Headers
        html = html.replace(this.rules.h1, '<h1>$1</h1>');
        html = html.replace(this.rules.h2, '<h2>$1</h2>');
        html = html.replace(this.rules.h3, '<h3>$1</h3>');
        html = html.replace(this.rules.h4, '<h4>$1</h4>');
        html = html.replace(this.rules.h5, '<h5>$1</h5>');
        html = html.replace(this.rules.h6, '<h6>$1</h6>');
        
        // Bold and italic
        html = html.replace(this.rules.bold, '<strong>$1</strong>');
        html = html.replace(this.rules.italic, '<em>$1</em>');
        
        // Links
        html = html.replace(this.rules.link, '<a href="$2">$1</a>');
        
        // Inline code
        html = html.replace(this.rules.inlineCode, '<code>$1</code>');
        
        // Blockquotes
        html = html.replace(this.rules.blockquote, '<blockquote>$1</blockquote>');
        
        // Horizontal rule
        html = html.replace(this.rules.hr, '<hr>');
        
        // Lists are tricky, we need to group them
        let htmlLines = html.split('\n');
        let inList = false;
        let listType = '';
        let listBuffer = [];
        
        // Process lines individually to handle lists properly
        for (let i = 0; i < htmlLines.length; i++) {
            let line = htmlLines[i];
            
            // Unordered list items
            if (line.match(/^\* (.*$)/)) {
                if (!inList || listType !== 'ul') {
                    if (inList) {
                        // Close the previous list
                        htmlLines[i-1] += listType === 'ol' ? '</ol>' : '</ul>';
                    }
                    line = line.replace(/^\* (.*)$/, '<ul><li>$1</li>');
                    inList = true;
                    listType = 'ul';
                } else {
                    line = line.replace(/^\* (.*)$/, '<li>$1</li>');
                }
            } 
            // Ordered list items
            else if (line.match(/^\d+\. (.*$)/)) {
                if (!inList || listType !== 'ol') {
                    if (inList) {
                        // Close the previous list
                        htmlLines[i-1] += listType === 'ol' ? '</ol>' : '</ul>';
                    }
                    line = line.replace(/^\d+\. (.*)$/, '<ol><li>$1</li>');
                    inList = true;
                    listType = 'ol';
                } else {
                    line = line.replace(/^\d+\. (.*)$/, '<li>$1</li>');
                }
            } 
            // Not a list item
            else if (inList) {
                // Close the list
                htmlLines[i-1] += listType === 'ol' ? '</ol>' : '</ul>';
                inList = false;
            }
            
            htmlLines[i] = line;
        }
        
        // Close any open list at the end
        if (inList) {
            htmlLines[htmlLines.length-1] += listType === 'ol' ? '</ol>' : '</ul>';
        }
        
        html = htmlLines.join('\n');
        
        // Handle paragraphs (anything that's not already wrapped in HTML tags)
        html = '<p>' + html + '</p>';
        html = html.replace(/<\/p>\s*<p>/g, '</p>\n\n<p>');
        
        // Fix paragraphs that contain block elements
        const blockElements = ['<h1>', '<h2>', '<h3>', '<h4>', '<h5>', '<h6>', '<ul>', '<ol>', '<blockquote>', '<pre>', '<hr>'];
        
        blockElements.forEach(tag => {
            // Remove paragraph tags around block elements
            const openingTagRegex = new RegExp(`<p>(\\s*${tag.replace('<', '\\<')})`, 'g');
            html = html.replace(openingTagRegex, '$1');
            
            const closingTag = '</' + tag.substring(1);
            const closingTagRegex = new RegExp(`(${closingTag.replace('<', '\\<')}\\s*)<\\/p>`, 'g');
            html = html.replace(closingTagRegex, '$1');
        });
        
        return html;
    }
    
    /**
     * Escape HTML special characters
     * @param {string} text - Text to escape
     * @return {string} Escaped text
     */
    _escapeHtml(text) {
        const escapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.replace(/[&<>"']/g, match => escapeMap[match]);
    }
}

// Example usage:
// const converter = new MarkdownConverter();
// const html = converter.convertToHtml('# Hello\n\nThis is **bold** and *italic*.');
// console.log(html);
