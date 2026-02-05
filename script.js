document.addEventListener('DOMContentLoaded', () => {
    const markdownEditorElement = document.getElementById('markdown-editor');
    const noteTitleInput = document.getElementById('note-title');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const deleteNoteBtn = document.getElementById('delete-note-btn');
    const newNoteBtn = document.getElementById('new-note-btn');
    const noteList = document.getElementById('note-list');
    const markdownPreview = document.getElementById('markdown-preview');
    
    // New Contact Elements
    const contactBtn = document.getElementById('contact-btn');
    const contactSection = document.getElementById('contact-section');
    const workspace = document.querySelector('.workspace');
    const contentHeader = document.querySelector('.content-header');

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
        forceSync: true,
    });

    let currentNoteId = null;

    const renderMarkdown = () => {
        if (typeof marked !== 'undefined') {
            markdownPreview.innerHTML = marked.parse(easyMDE.value());
        }
    };

    easyMDE.codemirror.on('change', renderMarkdown);

    const loadNotes = () => {
        const notes = JSON.parse(localStorage.getItem('markdownNotes')) || {};
        noteList.innerHTML = '';

        const sortedNotes = Object.values(notes).sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

        sortedNotes.forEach(note => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = note.title || '제목 없음';
            link.dataset.id = note.id;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showEditor();
                selectNote(note.id);
            });
            listItem.appendChild(link);
            noteList.appendChild(listItem);
        });
    };

    const showEditor = () => {
        workspace.style.display = 'flex';
        contentHeader.style.display = 'flex';
        contactSection.style.display = 'none';
    };

    const selectNote = (id) => {
        const notes = JSON.parse(localStorage.getItem('markdownNotes')) || {};
        const note = notes[id];
        if (note) {
            currentNoteId = id;
            noteTitleInput.value = note.title;
            easyMDE.value(note.content);
            renderMarkdown();
            deleteNoteBtn.style.display = 'inline-block';

            document.querySelectorAll('#note-list li').forEach(item => {
                item.classList.remove('active');
            });
            const activeLink = document.querySelector(`#note-list a[data-id="${id}"]`);
            if (activeLink) activeLink.closest('li').classList.add('active');
        }
    };

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
            notes[currentNoteId].title = title;
            notes[currentNoteId].content = content;
            notes[currentNoteId].lastModified = now;
        } else {
            const newId = Date.now().toString();
            notes[newId] = { id: newId, title: title, content: content, createdAt: now, lastModified: now };
            currentNoteId = newId;
        }
        localStorage.setItem('markdownNotes', JSON.stringify(notes));
        loadNotes();
        selectNote(currentNoteId);
        alert('노트가 저장되었습니다!');
    });

    newNoteBtn.addEventListener('click', () => {
        showEditor();
        currentNoteId = null;
        noteTitleInput.value = '';
        easyMDE.value('새 노트를 작성하세요!');
        renderMarkdown();
        deleteNoteBtn.style.display = 'none';
        document.querySelectorAll('#note-list li').forEach(item => item.classList.remove('active'));
        noteTitleInput.focus();
    });

    deleteNoteBtn.addEventListener('click', () => {
        if (currentNoteId && confirm('정말로 이 노트를 삭제하시겠습니까?')) {
            const notes = JSON.parse(localStorage.getItem('markdownNotes')) || {};
            delete notes[currentNoteId];
            localStorage.setItem('markdownNotes', JSON.stringify(notes));
            newNoteBtn.click();
            loadNotes();
            alert('노트가 삭제되었습니다.');
        }
    });

    // Contact Button logic
    contactBtn.addEventListener('click', () => {
        workspace.style.display = 'none';
        contentHeader.style.display = 'none';
        contactSection.style.display = 'flex';
        document.querySelectorAll('#note-list li').forEach(item => item.classList.remove('active'));
    });

    // Initial load
    loadNotes();
    newNoteBtn.click();
    renderMarkdown();
});