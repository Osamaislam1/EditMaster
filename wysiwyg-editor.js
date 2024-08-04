class WYSIWYGEditor {
    constructor(textareaId) {
        this.textarea = document.getElementById(textareaId);
        if (!this.textarea) {
            console.error(`Textarea with id "${textareaId}" not found.`);
            return;
        }

        this.editorContainer = this.createEditorContainer();
        this.textarea.style.display = 'none';
        this.textarea.insertAdjacentElement('afterend', this.editorContainer);

        window.wysiwygEditorInstance = this;

        this.init();
    }

    createEditorContainer() {
        const container = document.createElement('div');
        container.className = 'editor-container';

        const style = document.createElement('style');
        style.textContent = this.getStyles();
        container.appendChild(style);

        const toolbar = document.createElement('div');
        toolbar.className = 'toolbar';
        toolbar.innerHTML = this.getToolbarButtons();

        const tabContainer = document.createElement('div');
        tabContainer.className = 'tab-container';
        tabContainer.innerHTML = `
            <div id="wysiwygTab" class="tab active" onclick="window.wysiwygEditorInstance.showEditor()">WYSIWYG</div>
            <div id="sourceTab" class="tab" onclick="window.wysiwygEditorInstance.showSource()">Source</div>
        `;

        const editorIframe = document.createElement('iframe');
        editorIframe.id = 'editor';
        editorIframe.className = 'editor';
        editorIframe.frameBorder = '0';

        const sourceEditor = document.createElement('textarea');
        sourceEditor.id = 'sourceEditor';
        sourceEditor.className = 'source-editor';

        container.appendChild(toolbar);
        container.appendChild(tabContainer);
        container.appendChild(editorIframe);
        container.appendChild(sourceEditor);

        return container;
    }

    getStyles() {
        return `
            .editor-container {
                display: flex;
                flex-direction: column;
                height: 100vh;
                position: relative;
                font-family: Arial, sans-serif;
            }
            .toolbar {
                display: flex;
                flex-wrap: wrap;
                margin-bottom: 10px;
                padding: 10px;
                border-bottom: 1px solid #ccc;
                background-color: #f4f4f4;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .toolbar button, .toolbar select, .toolbar input {
                margin: 2px;
                padding: 8px;
                font-size: 14px;
                border: 1px solid #ccc;
                border-radius: 4px;
                background-color: #fff;
                cursor: pointer;
                transition: background-color 0.3s, box-shadow 0.3s;
            }
            .toolbar button:hover, .toolbar select:hover, .toolbar input:hover {
                background-color: #e9e9e9;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .tab-container {
                display: flex;
                border-bottom: 1px solid #ddd;
                margin-bottom: 10px;
            }
            .tab {
                padding: 10px 20px;
                cursor: pointer;
                background: #f0f0f0;
                border: 1px solid #ddd;
                border-radius: 4px 4px 0 0;
                margin-right: 5px;
                flex: 1;
                text-align: center;
                transition: background-color 0.3s, box-shadow 0.3s;
            }
            .tab.active {
                background: #ddd;
                font-weight: bold;
                box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
            }
            .tab:hover {
                background-color: #e9e9e9;
            }
            .editor, .source-editor {
                border: 1px solid #ccc;
                margin-top: 5px;
                resize: both;
                overflow: auto;
                height: 300px;
                box-sizing: border-box;
                border-radius: 4px;
                padding: 10px;
                font-size: 14px;
                line-height: 1.6;
            }
            .editor {
                display: block;
                min-width: 300px;
                min-height: 200px;
                font-size: 12px;
            }
            .source-editor {
                display: none;
                font-family: monospace;
                white-space: pre;
                height: calc(100vh - 100px);
                box-sizing: border-box;
            }
        `;
    }

    getToolbarButtons() {
        return `
            <button title="Bold" onclick="window.wysiwygEditorInstance.execCmd('bold')"><i class="fas fa-bold"></i></button>
            <button title="Italic" onclick="window.wysiwygEditorInstance.execCmd('italic')"><i class="fas fa-italic"></i></button>
            <button title="Underline" onclick="window.wysiwygEditorInstance.execCmd('underline')"><i class="fas fa-underline"></i></button>
            <button title="Create Link" onclick="window.wysiwygEditorInstance.createLink()"><i class="fas fa-link"></i></button>
            <button title="Insert Image" onclick="window.wysiwygEditorInstance.insertImage()"><i class="fas fa-image"></i></button>
            <button title="Ordered List" onclick="window.wysiwygEditorInstance.execCmd('insertOrderedList')"><i class="fas fa-list-ol"></i></button>
            <button title="Unordered List" onclick="window.wysiwygEditorInstance.execCmd('insertUnorderedList')"><i class="fas fa-list-ul"></i></button>
            <button title="Justify Left" onclick="window.wysiwygEditorInstance.execCmd('justifyLeft')"><i class="fas fa-align-left"></i></button>
            <button title="Justify Center" onclick="window.wysiwygEditorInstance.execCmd('justifyCenter')"><i class="fas fa-align-center"></i></button>
            <button title="Justify Right" onclick="window.wysiwygEditorInstance.execCmd('justifyRight')"><i class="fas fa-align-right"></i></button>
            <select id="headerSelect" onchange="window.wysiwygEditorInstance.execCmd('formatBlock', this.value)">
                <option value="P">Paragraph</option>
                <option value="H1">H1</option>
                <option value="H2">H2</option>
                <option value="H3">H3</option>
                <option value="H4">H4</option>
                <option value="H5">H5</option>
                <option value="H6">H6</option>
                <option value="BLOCKQUOTE">Quote</option>
            </select>
            <select id="fontSelect" onchange="window.wysiwygEditorInstance.execCmd('fontName', this.value)">
                <option value="">Font</option>
            </select>
            <select id="fontSizeSelect" onchange="window.wysiwygEditorInstance.updateFontSize(this.value)">
            </select>
            <input type="color" onchange="window.wysiwygEditorInstance.execCmd('foreColor', this.value)" title="Text Color">
            <input type="color" onchange="window.wysiwygEditorInstance.execCmd('hiliteColor', this.value)" title="Background Color">
            <button title="Show WYSIWYG Editor" onclick="window.wysiwygEditorInstance.showEditor()"><i class="fas fa-eye"></i></button>
            <button title="Show Source Code" onclick="window.wysiwygEditorInstance.showSource()"><i class="fas fa-code"></i></button>
            <button title="Export as Word" onclick="window.wysiwygEditorInstance.exportWord()"><i class="fas fa-file-word"></i></button>
            <button title="Export as PDF" onclick="window.wysiwygEditorInstance.exportPDF()"><i class="fas fa-file-pdf"></i></button>
        `;
    }

    init() {
        this.iframe = document.getElementById('editor');
        this.doc = this.iframe.contentDocument || this.iframe.contentWindow.document;
        this.sourceEditor = document.getElementById('sourceEditor');
        this.wysiwygTab = document.getElementById('wysiwygTab');
        this.sourceTab = document.getElementById('sourceTab');

        this.doc.open();
        this.doc.write('<html><head><style>body { font-family: Arial, sans-serif; font-size: 12px; margin: 10px; }</style></head><body contenteditable="true"></body></html>');
        this.doc.close();

        this.populateFontOptions();
        this.populateFontSizeOptions();

        this.sourceEditor.addEventListener('input', () => {
            this.doc.body.innerHTML = this.sourceEditor.value;
        });

        this.showEditor();
        this.execCmd('formatBlock', 'P'); // Set default format to paragraph
        // this.execCmd('fontSize', '3'); // Set default font size to 12
        this.doc.body.style.fontSize = '12px';
    }

    populateFontOptions() {
        const fonts = ['Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Comic Sans MS'];
        const fontSelect = document.getElementById('fontSelect');
        fonts.forEach(font => {
            const option = document.createElement('option');
            option.value = font;
            option.textContent = font;
            fontSelect.appendChild(option);
        });
    }

    populateFontSizeOptions() {
        const fontSizeSelect = document.getElementById('fontSizeSelect');
        const sizes = Array.from({ length: 30 }, (_, i) => i + 2).concat([36, 48, 72]);
        sizes.forEach(size => {
            const option = document.createElement('option');
            option.value = size;
            option.textContent = size + 'px';
            fontSizeSelect.appendChild(option);
        });
        fontSizeSelect.value = '12'; // Set default font size to 12
    }

    execCmd(command, value) {
        this.doc.execCommand(command, false, value);
    }

    createLink() {
        const url = prompt("Enter the URL");
        if (url) {
            this.execCmd('createLink', url);
        }
    }

    insertImage() {
        const url = prompt("Enter the image URL");
        if (url) {
            this.execCmd('insertImage', url);
        }
    }

    updateFontSize(size) {
        if (size) {
            this.doc.body.style.fontSize = size + 'px';
        }
    }
    showEditor() {
        this.iframe.style.display = 'block';
        this.sourceEditor.style.display = 'none';
        this.wysiwygTab.classList.add('active');
        this.sourceTab.classList.remove('active');
    }

    showSource() {
        this.iframe.style.display = 'none';
        this.sourceEditor.style.display = 'block';
        this.sourceEditor.value = this.doc.body.innerHTML;
        this.sourceTab.classList.add('active');
        this.wysiwygTab.classList.remove('active');
    }

    exportWord() {
        const blob = new Blob([this.doc.body.innerHTML], { type: 'application/msword' });
        saveAs(blob, 'document.doc');
    }

    exportPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.html(this.doc.body, {
            callback: function (pdf) {
                pdf.save('document.pdf');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WYSIWYGEditor('myEditor');
});
