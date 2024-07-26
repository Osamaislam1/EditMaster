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

        // Store the instance in a global variable
        window.wysiwygEditorInstance = this;

        this.init();
    }

    createEditorContainer() {
        const container = document.createElement('div');
        container.className = 'editor-container';

        // Add CSS styles for the editor
        const style = document.createElement('style');
        style.textContent = `
            /* Basic styling for the editor container */
            .editor-container {
                display: flex;
                flex-direction: column;
                height: 100vh;
                position: relative; /* Ensure the resizable handle is positioned correctly */
            }

            .toolbar {
                display: flex;
                flex-wrap: wrap;
                margin-bottom: 10px;
                padding: 5px;
                border-bottom: 1px solid #ccc;
                background-color: #f9f9f9;
            }
            .toolbar button, .toolbar select, .toolbar input {
                margin: 2px;
                padding: 5px;
                font-size: 14px;
                border: 1px solid #ccc;
                border-radius: 4px;
                background-color: #fff;
                cursor: pointer;
            }
            .toolbar button:hover, .toolbar select:hover, .toolbar input:hover {
                background-color: #f0f0f0;
            }
            .tab-container {
                display: flex;
                border-bottom: 1px solid #ddd;
            }
            .tab {
                padding: 10px;
                cursor: pointer;
                background: #f0f0f0;
                border: 1px solid #ddd;
                border-radius: 4px;
                margin-right: 5px;
                flex: 1;
                text-align: center;
            }
            .tab.active {
                background: #ddd;
                font-weight: bold;
            }
            .editor, .source-editor {
                border: 1px solid #ccc;
                margin-top: 5px;
                resize: both; /* Allow resizing both horizontally and vertically */
                overflow: auto; /* Ensure content is scrollable if it overflows */
                height: 300px; /* Initial height, can be changed based on preference */
                box-sizing: border-box;
            }
            .editor {
                display: block;
                min-width: 300px; /* Minimum width to prevent too small resizing */
                min-height: 200px; /* Minimum height to prevent too small resizing */
            }
            .source-editor {
                display: none;
                font-family: monospace;
                white-space: pre;
                overflow: auto;
                height: calc(100vh - 75px); /* Adjust based on toolbar and tab height */
                box-sizing: border-box;
            }
        `;
        container.appendChild(style);

        const toolbar = document.createElement('div');
        toolbar.className = 'toolbar';
        toolbar.innerHTML = `
            <button onclick="window.wysiwygEditorInstance.execCmd('bold')"><b>B</b></button>
            <button onclick="window.wysiwygEditorInstance.execCmd('italic')"><i>I</i></button>
            <button onclick="window.wysiwygEditorInstance.execCmd('underline')"><u>U</u></button>
            <button onclick="window.wysiwygEditorInstance.execCmd('createLink')">Link</button>
            <button onclick="window.wysiwygEditorInstance.execCmd('insertImage')">Image</button>
            <button onclick="window.wysiwygEditorInstance.execCmd('insertOrderedList')">OL</button>
            <button onclick="window.wysiwygEditorInstance.execCmd('insertUnorderedList')">UL</button>
            <button onclick="window.wysiwygEditorInstance.execCmd('justifyLeft')">Left</button>
            <button onclick="window.wysiwygEditorInstance.execCmd('justifyCenter')">Center</button>
            <button onclick="window.wysiwygEditorInstance.execCmd('justifyRight')">Right</button>
            <button onclick="window.wysiwygEditorInstance.execCmd('justifyLeft')">LTR</button>
            <button onclick="window.wysiwygEditorInstance.execCmd('justifyRight')">RTL</button>
            <select id="headerSelect" onchange="window.wysiwygEditorInstance.execCmd('formatBlock', this.value)">
                <option value="">Header</option>
                <option value="H1">H1</option>
                <option value="H2">H2</option>
                <option value="H3">H3</option>
                <option value="H4">H4</option>
                <option value="H5">H5</option>
                <option value="H6">H6</option>
                <option value="P">Paragraph</option>
                <option value="BLOCKQUOTE">Quote</option>
            </select>
            <select id="fontSelect" onchange="window.wysiwygEditorInstance.execCmd('fontName', this.value)">
                <option value="">Font</option>
            </select>
            <select id="fontSizeSelect" onchange="window.wysiwygEditorInstance.updateFontSize(this.value)">
                <!-- Options will be populated dynamically -->
            </select>
            <input id="customFontSize" type="number" min="2" max="72" placeholder="Custom size" oninput="window.wysiwygEditorInstance.applyCustomFontSize(this.value)" style="width: 60px;">
            <button onclick="window.wysiwygEditorInstance.changeFontSize(-1)">-</button>
            <button onclick="window.wysiwygEditorInstance.changeFontSize(1)">+</button>
            <input type="color" onchange="window.wysiwygEditorInstance.execCmd('foreColor', this.value)" title="Text Color">
            <input type="color" onchange="window.wysiwygEditorInstance.execCmd('hiliteColor', this.value)" title="Background Color">
            <button onclick="window.wysiwygEditorInstance.showEditor()">WYSIWYG</button>
            <button onclick="window.wysiwygEditorInstance.showSource()">Source</button>
        `;

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

    init() {
        this.iframe = document.getElementById('editor');
        this.doc = this.iframe.contentDocument || this.iframe.contentWindow.document;
        this.sourceEditor = document.getElementById('sourceEditor');
        this.wysiwygTab = document.getElementById('wysiwygTab');
        this.sourceTab = document.getElementById('sourceTab');

        this.doc.open();
        this.doc.write('<html><head><style>body { font-family: Arial, sans-serif; font-size: 11px; margin: 10px; }</style></head><body contenteditable="true"></body></html>');
        this.doc.close();

        this.populateFontOptions();
        this.populateFontSizeOptions();

        this.sourceEditor.addEventListener('input', () => {
            this.doc.body.innerHTML = this.sourceEditor.value;
        });

        this.showEditor();
    }

    populateFontOptions() {
        const fonts = [
            'Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Comic Sans MS'
        ];
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
            option.textContent = size;
            fontSizeSelect.appendChild(option);
        });
    }

    execCmd(command, value) {
        this.doc.execCommand(command, false, value);
    }

    updateFontSize(size) {
        if (size) {
            this.execCmd('fontSize', size);
        }
    }

    applyCustomFontSize(size) {
        if (size) {
            this.execCmd('fontSize', size);
        }
    }

    changeFontSize(step) {
        const fontSizeSelect = document.getElementById('fontSizeSelect');
        let currentSize = parseInt(fontSizeSelect.value, 10);
        if (!currentSize) return;

        const newSize = Math.max(2, Math.min(72, currentSize + step));
        fontSizeSelect.value = newSize;
        this.updateFontSize(newSize);
    }

    showEditor() {
        document.querySelector('.editor').style.display = 'block';
        document.querySelector('.source-editor').style.display = 'none';
        document.getElementById('wysiwygTab').classList.add('active');
        document.getElementById('sourceTab').classList.remove('active');
    }

    showSource() {
        document.querySelector('.editor').style.display = 'none';
        document.querySelector('.source-editor').style.display = 'block';
        document.getElementById('sourceEditor').value = this.doc.body.innerHTML;
        document.getElementById('sourceTab').classList.add('active');
        document.getElementById('wysiwygTab').classList.remove('active');
    }
}
