// Configuração do Firebase (substitua com suas credenciais)
const firebaseConfig = {
    apiKey: "AIzaSyDHkscCAj8pSyeN5KPXUn072_5XeSFF04M",
  authDomain: "fire-news-f1be1.firebaseapp.com",
  databaseURL: "https://fire-news-f1be1-default-rtdb.firebaseio.com",
  projectId: "fire-news-f1be1",
  storageBucket: "fire-news-f1be1.appspot.com",
  messagingSenderId: "368411474818",
  appId: "1:368411474818:web:567947238fa8f2da5fad9b"
};

// Inicialize o Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Elementos da interface
const titleInput = document.getElementById('title');
const linkInput = document.getElementById('link');
const submitButton = document.getElementById('submit');
const linkList = document.getElementById('link-list');
const tabAll = document.getElementById('tab-all');
const tabPopular = document.getElementById('tab-popular');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

// Função para gerar um código único
function generateCode() {
  return Math.random().toString(36).substring(2, 9);
}

// Função para validar o link
function isValidLink(link) {
  const allowedDomains = ['mediafire.com', 'mega.nz', 'drive.google.com'];
  return allowedDomains.some(domain => link.includes(domain));
}

// Adicionar link ao banco de dados
submitButton.addEventListener('click', () => {
  const title = titleInput.value.trim();
  const link = linkInput.value.trim();

  if (title && link && isValidLink(link)) {
    const code = generateCode();
    const newLink = {
      title,
      link,
      code,
      downloads: 0
    };

    database.ref('links/' + code).set(newLink)
      .then(() => {
        titleInput.value = '';
        linkInput.value = '';
        alert('Link adicionado com sucesso!');
      })
      .catch(error => {
        console.error('Erro ao adicionar link:', error);
      });
  } else {
    alert('Por favor, insira um título e um link válido (MediaFire, Mega ou Drive).');
  }
});

// Função para exibir links
function displayLinks(links) {
  linkList.innerHTML = '';
  links.forEach(linkData => {
    const linkItem = document.createElement('div');
    linkItem.className = 'link-item';
    linkItem.innerHTML = `
      <strong>${linkData.title}</strong>
      <a href="${linkData.link}" target="_blank">${linkData.link}</a>
      <p>Código: ${linkData.code} | Downloads: ${linkData.downloads}</p>
    `;
    linkList.appendChild(linkItem);
  });
}

// Carregar e exibir links
function loadLinks(orderBy = 'code') {
  database.ref('links').orderByChild(orderBy).on('value', snapshot => {
    const links = [];
    snapshot.forEach(childSnapshot => {
      links.push(childSnapshot.val());
    });
    displayLinks(links);
  });
}

// Função para pesquisar links
function searchLinks(query) {
  database.ref('links').on('value', snapshot => {
    const links = [];
    snapshot.forEach(childSnapshot => {
      const linkData = childSnapshot.val();
      if (linkData.title.toLowerCase().includes(query.toLowerCase()) || linkData.code.includes(query)) {
        links.push(linkData);
      }
    });
    displayLinks(links);
  });
}

// Alternar entre abas
tabAll.addEventListener('click', () => {
  tabAll.classList.add('active');
  tabPopular.classList.remove('active');
  loadLinks('code');
});

tabPopular.addEventListener('click', () => {
  tabPopular.classList.add('active');
  tabAll.classList.remove('active');
  loadLinks('downloads');
});

// Pesquisar links
searchButton.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (query) {
    searchLinks(query);
  } else {
    loadLinks('code');
  }
});

// Carregar links ao iniciar
loadLinks();
