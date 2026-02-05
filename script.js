document.addEventListener('DOMContentLoaded', () => {
    const markdownEditorElement = document.getElementById('markdown-editor');
    const noteTitleInput = document.getElementById('note-title');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const deleteNoteBtn = document.getElementById('delete-note-btn');
    const newNoteBtn = document.getElementById('new-note-btn');
    const noteList = document.getElementById('note-list');
    const markdownPreview = document.getElementById('markdown-preview');

    let easyMDE = new EasyMDE({
        element: markdownEditorElement,
        spellChecker: false,
        initialValue: '새 노트를 작성하세요!',
        parsingConfig: {
            allowAtxHeaderWithoutSpace: true,
            strictEmphasis: true,
            strikethrough: true,
            literalMidWordUnderscores: true,
            fencedCodeBlocks: true,
            taskLists: true,
            emoji: true,
        },
        renderingConfig: {
            singleLineBreaks: false,
            codeSyntaxHighlighting: true,
        },
        forceSync: true, // Ensures textarea is always in sync with the editor
    });

    let currentNoteId = null;

    // Function to render markdown
    const renderMarkdown = () => {
        markdownPreview.innerHTML = marked.parse(easyMDE.value());
    };

    easyMDE.codemirror.on('change', renderMarkdown);

    // Load notes from LocalStorage
    const loadNotes = () => {
        const notes = JSON.parse(localStorage.getItem('markdownNotes')) || {};
        noteList.innerHTML = ''; // Clear current list

        // Sort notes by last modified date in descending order
        const sortedNotes = Object.values(notes).sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

        sortedNotes.forEach(note => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = note.title || '제목 없음';
            link.dataset.id = note.id;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                selectNote(note.id);
            });
            listItem.appendChild(link);
            noteList.appendChild(listItem);
        });
    };

    // Select a note to edit/view
    const selectNote = (id) => {
        const notes = JSON.parse(localStorage.getItem('markdownNotes')) || {};
        const note = notes[id];
        if (note) {
            currentNoteId = id;
            noteTitleInput.value = note.title;
            easyMDE.value(note.content);
            renderMarkdown();
            deleteNoteBtn.style.display = 'inline-block'; // Show delete button

            // Update active class in sidebar
            document.querySelectorAll('#note-list li').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector(`#note-list a[data-id="${id}"]`).closest('li').classList.add('active');
        }
    };

    // Save a note to LocalStorage
    saveNoteBtn.addEventListener('click', () => {
        const notes = JSON.parse(localStorage.getItem('markdownNotes')) || {};
        const title = noteTitleInput.value.trim();
        const content = easyMDE.value();

        if (!title) {
            alert('노트 제목을 입력해주세요!');
            return;
        }

        const now = new Date().toISOString();
        if (currentNoteId) {
            // Update existing note
            notes[currentNoteId].title = title;
            notes[currentNoteId].content = content;
            notes[currentNoteId].lastModified = now;
        } else {
            // Create new note
            const newId = Date.now().toString(); // Simple unique ID
            notes[newId] = { id: newId, title: title, content: content, createdAt: now, lastModified: now };
            currentNoteId = newId;
        }
        localStorage.setItem('markdownNotes', JSON.stringify(notes));
        loadNotes();
        selectNote(currentNoteId); // Re-select to update active state and ensure consistent view
        alert('노트가 저장되었습니다!');
    });

    // Create a new note
    newNoteBtn.addEventListener('click', () => {
        currentNoteId = null;
        noteTitleInput.value = '';
        easyMDE.value('새 노트를 작성하세요!');
        renderMarkdown();
        deleteNoteBtn.style.display = 'none'; // Hide delete button for new note
        document.querySelectorAll('#note-list li').forEach(item => item.classList.remove('active')); // Clear active selection
        noteTitleInput.focus();
    });

    // Delete a note
    deleteNoteBtn.addEventListener('click', () => {
        if (currentNoteId && confirm('정말로 이 노트를 삭제하시겠습니까?')) {
            const notes = JSON.parse(localStorage.getItem('markdownNotes')) || {};
            delete notes[currentNoteId];
            localStorage.setItem('markdownNotes', JSON.stringify(notes));
            
            // After deleting, create a new empty note or load the first available note
            newNoteBtn.click(); // Simulate clicking 'New Note' to clear editor
            loadNotes();
            alert('노트가 삭제되었습니다.');
        }
    });

    // Initial load
    loadNotes();
    newNoteBtn.click(); // Start with a new empty note editor
    renderMarkdown(); // Initial render for the default text
});
