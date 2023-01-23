let botaoAtivo = document.querySelector(".login-Button");
let inputAtivo = document.querySelector(".login-screen input");
const mensagemErro = document.querySelector(".error"); // Mensagem de erro de login
let nome; // Recebe o nome do usuário atual
let usuarios = ["Todos"]; // Lista local de usuários online
let privacidade = "message"; // Recebe a visibilidade da mensagem (Pública ou Privada)
let destinatario = "Todos"; // Recebe o nome de pra quem deve ser enviada a mensagem

let textoPrivacidade =""; // Variável para configurar o texto sobre a visibilidade da mensagem
configuraTextoPrivacidade(); // Texto que aparece embaixo da caixa de texto da mensagem

// Se a tecla ENTER for clicada na página de login entra na sala do chat
// Se a tecla ENTER for clicada na sala do chat envia a mensagem
document.addEventListener("keypress", clicaEnter);
function clicaEnter(tecla){
  if(tecla.key === 'Enter' && inputAtivo.value.length !== 0) {   
    botaoAtivo.click();  
  }
} 
// Configura o input da tela de login para ficar branco sempre que o usuário for escrever algo
function resetInput (elemento){
  elemento.style.backgroundColor = "white";
}
// Ativa o botão quando o usuário entra com o nome para fazer login
function ativarBotao(input){
  const botao = document.querySelector(".login-Button");  
  // Testa se o input não está vazio
  if (input.value.length >= 1){
    botao.style.backgroundColor = "#9dbd6a";
    botao.style.color = "White";
    botao.classList.add("habilitado");
    botao.removeAttribute("disabled");
  }
  // Quando o usuário apaga o texto do input o botão volta a ficar desabilitado
  else {
    botao.style.backgroundColor = "#E7E7E7";
    botao.style.color = "#696969";
    botao.classList.remove("habilitado");
    botao.disabled = true;
  }
}

// Função para tentar entrar na sala quando o usuário clica no botão de entrar da tela de login
function logar(){
  nome = document.querySelector(".login-screen input").value;
  let usuario = {name: nome};
  // Ativa o efeito de "carregando" antes de entrar na sala
  const loading = document.querySelector(".loading");
  loading.classList.remove("hidden");
  setTimeout(function(){document.querySelector(".loading").classList.add("hidden");}, 2000);
  // Troca o botão e o input que serão ativados ao clicar a tecla Enter
  botaoAtivo = document.querySelector(".botaoEnviar");
  inputAtivo = document.querySelector(".message-input input");
  // Tenta entrar na sala com o nome informado pelo usuário
  const promessa = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', usuario);
  promessa.then(entrarNaSala);
  promessa.catch(erroLogin);
}
function entrarNaSala(resposta){
  console.log ("Usuário entrou na sala!" + resposta);
  // Limpa a caixa de texto para enviar mensagem
  document.querySelector("footer input").value = "";
  // Esconde a tela de login e a mensagem de erro
  mensagemErro.classList.add("hidden");
  document.querySelector(".login-screen").classList.add("hidden");
  // Carrega as mensagens do chat e a lista de participantes
  carregarMensagens();
  carregarParticipantes();
  // Configura para carregar as mensagens, os participantes e para manter a conexão do usuário
  setInterval(carregarMensagens, 3000);
  setInterval(manterConexao, 5000);
  setInterval(carregarParticipantes, 10000);  
}
function erroLogin(erro){
  console.log ("Erro ao entrar na sala! " + erro);
  if (erro.response.status === 400){
    // Mostra uma mensagem de erro pedindo para o usuario digitar outro nome e muda a cor do input para rosa
    document.querySelector(".login-screen input").style.backgroundColor = "rgb(255, 216, 216)";
    mensagemErro.innerHTML = `O nome ${nome} já está em uso! <br> Por favor digite outro nome`;
    mensagemErro.classList.remove("hidden");
    // Troca novamente o botão e o input que serão ativados ao clicar a tecla Enter
    botaoAtivo = document.querySelector(".login-Button");
    inputAtivo = document.querySelector(".login-screen input");
  }
}

// Carrega as mensagens do chat
function carregarMensagens(resposta){
  console.log("Carregar as mensagens do chat " + resposta);
  // Faz um request para o servidor para receber as mensagens do chat
  const promesssa = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
  promesssa.then(exibirMensagens); 
  promesssa.catch(erroMensagem);
}
function exibirMensagens(resposta){
  // listaMensagens recebe a lista de mensagens que o servidor retornou
  const listaMensagens = resposta.data;
  const chat = document.querySelector(".chat");
  let mensagem;
  // Limpa as mensagens mais antigas do chat
  chat.innerHTML = "";  
  for (let i = 0; i < listaMensagens.length; i++){
    // Testa o tipo de cada mensagem e manda para ser renderizada no chat
    if (listaMensagens[i].type === "status"){
      mensagem = `<li data-test="message" class="log"> 
                    <p> <span class="time">(${listaMensagens[i].time})</span>
                    <span class="author">${listaMensagens[i].from}</span>
                    <span class="message-text">${listaMensagens[i].text}</span></p>
                  </li> `;
      chat.innerHTML = chat.innerHTML + mensagem;
    }
    if (listaMensagens[i].type === "message"){
      mensagem = `<li data-test="message" class="public message"> 
                    <p> <span class="time">(${listaMensagens[i].time})</span>
                    <span class="author">${listaMensagens[i].from}</span>
                    para
                    <span class="receiver">${listaMensagens[i].to}</span>: 
                    <span class="message-text">${listaMensagens[i].text}</span></p>
                  </li> `;
      chat.innerHTML = chat.innerHTML + mensagem;
    }

    // Se a mensagem for do tipo privada só renderiza se for de/para o usuário
    if (listaMensagens[i].type === "private_message" && (listaMensagens[i].from.toLowerCase().trim() === nome.toLowerCase().trim() || listaMensagens[i].to.toLowerCase().trim() === nome.toLowerCase().trim())){
      mensagem = `<li data-test="message" class="private message"> 
                    <p> <span class="time">(${listaMensagens[i].time})</span>
                    <span class="author">${listaMensagens[i].from}</span>
                    <span class="privately">reservadamente</span>
                    para
                    <span class="receiver">${listaMensagens[i].to}</span>: 
                    <span class="message-text">${listaMensagens[i].text}</span></p>
                  </li> `;
      chat.innerHTML = chat.innerHTML + mensagem;
    }    
  }
  // Faz o scroll dinâmico das mensagens 
  chat.innerHTML = chat.innerHTML + `<div class="final"> </div>`;
  document.querySelector(".final").scrollIntoView(false);
}

// Carrega a lista de participantes online
function carregarParticipantes (){
  const promessa = axios.get('https://mock-api.driven.com.br/api/v6/uol/participants');
  promessa.then(verificarUsuarios);
  promessa.catch(erroCarregarParticipantes);
}
function verificarUsuarios(resposta){
  // listaUsuariosServidor recebe a lista de usuários que estão online no chat
  const listaUsuariosServidor = resposta.data;
  const listaNomes = [];
  let jaExiste;
  let userOnline;

  for (let i = 0; i < listaUsuariosServidor.length; i++){
    // listaNomes recebe a lista de nomes de todos os usuários que estão online
    listaNomes.push(listaUsuariosServidor[i].name);
    // Filtro para pegar apenas os usuários novos e colocar na lista de usuários local
    jaExiste = usuarios.find(elemento => elemento.toLowerCase() === listaUsuariosServidor[i].name.toLowerCase());
    if (jaExiste === undefined){
      usuarios.push(listaUsuariosServidor[i].name);
    }
  }

  // Remover os elementos da lista de usuários local que já não estão mais online 
  for (let i = 0; i < usuarios.length; i++){
    userOnline = listaNomes.find(elemento => elemento.toLowerCase() === usuarios[i].toLowerCase());
    if (userOnline === undefined && usuarios[i] !== "Todos"){
      usuarios.splice(i, 1);
    }
  }
  mostrarParticipantes();
}
function mostrarParticipantes(){
  const listaUsers = document.querySelector(".users");
  let mensagem;
  listaUsers.innerHTML = "";

  for (let i = 0; i < usuarios.length; i++){

    if (destinatario.toLowerCase().trim() === usuarios[i].toLowerCase().trim()){
      if (destinatario.toLowerCase().trim() === "todos"){
        mensagem = `<li data-test="all" class="user-message destinatario" onclick="escolheDestinatario(this);"> 
                      <div>
                          <ion-icon name="people"></ion-icon>
                          <p> Todos </p>
                      </div>
                      <ion-icon data-test="check" name="checkmark-sharp"></ion-icon>
                    </li>`;
      }
      else {
        mensagem = `<li data-test="participant" class="user-message destinatario" onclick="escolheDestinatario(this);"> 
                    <div>
                        <ion-icon name="person-circle"></ion-icon>
                        <p> ${usuarios[i]} </p>
                    </div>
                    <ion-icon data-test="check" name="checkmark-sharp"></ion-icon>
                  </li>`;
      }
    }

    else {

      if (usuarios[i].toLowerCase().trim() === "todos"){
        mensagem = `<li data-test="all" class="user-message" onclick="escolheDestinatario(this);"> 
                      <div>
                          <ion-icon name="people"></ion-icon>
                          <p> Todos </p>
                      </div>                      
                      <ion-icon data-test="check" name="checkmark-sharp" class="hidden"></ion-icon>
                      </li>`;
      }
      else {
        mensagem = `<li data-test="participant" class="user-message" onclick="escolheDestinatario(this);"> 
                      <div>
                          <ion-icon name="person-circle"></ion-icon>
                          <p> ${usuarios[i]} </p>
                      </div>
                      <ion-icon data-test="check" name="checkmark-sharp" class="hidden"></ion-icon>
                    </li>`;
      }
    }
      
    listaUsers.innerHTML = listaUsers.innerHTML + mensagem;
  }
}
function erroCarregarParticipantes(resposta){
  console.log("Erro ao carregar lista de participantes " +resposta);
  window.location.reload();
}

function manterConexao(){
  let usuario = {name: nome};
  const promessa = axios.post('https://mock-api.driven.com.br/api/v6/uol/status', usuario);
  promessa.catch(() => window.location.reload());
  //promessa.then(taOn);
  //promessa.catch(taOff);
}
function abrirSidebar(){
  document.querySelector(".titulo").scrollIntoView(true);
  document.querySelector(".users-list").classList.remove("hidden");
}
function fecharSidebar(){
  document.querySelector(".users-list").classList.add("hidden");
}
function statusPrivacidade(escolha){
  if (escolha.classList.contains("publica")){
    privacidade = "message";
    document.querySelector(".privada ion-icon:last-child").classList.add("hidden");
    document.querySelector(".publica ion-icon:last-child").classList.remove("hidden");
  }
  else if (escolha.classList.contains("privada") && destinatario.toLowerCase().trim() !== "todos"){
    privacidade = "private_message";
    document.querySelector(".publica ion-icon:last-child").classList.add("hidden");
    document.querySelector(".privada ion-icon:last-child").classList.remove("hidden"); 
  }
  configuraTextoPrivacidade();
}
function escolheDestinatario(escolha){

  let destinatarioAnterior = document.querySelector(".destinatario");

  if (destinatarioAnterior !== null ){
    destinatarioAnterior.classList.remove("destinatario");
    destinatarioAnterior.children[1].classList.add("hidden");
  }    

  escolha.classList.add("destinatario");
  destinatario = escolha.children[0].children[1].innerHTML;
  escolha.children[1].classList.remove("hidden");

  if (destinatario.toLowerCase().trim() === "todos"){
    //Muda privacidade para público
    privacidade = "message";
    document.querySelector(".privada ion-icon:last-child").classList.add("hidden");
    document.querySelector(".publica ion-icon:last-child").classList.remove("hidden");
  }

  configuraTextoPrivacidade();
}
function configuraTextoPrivacidade(){
  let configMensagem = document.querySelector(".caixa-mensagem");
  if (privacidade === "message"){
    textoPrivacidade = "publicamente";
  }
  else {
    textoPrivacidade = "reservadamente";
  }
  configMensagem.innerHTML = `<p>Enviando para <span class="receiver-selected"> ${destinatario} </span> (<span class="privacy-selected">${textoPrivacidade}</span>)</p>`;
}

function enviarMensagem(){
  // Recebe a lista de usuários online para verificar se o destinatário ainda está online
  let promessa = axios.get('https://mock-api.driven.com.br/api/v6/uol/participants');
  promessa.then(verificaDestinatarioOnline);
  promessa.catch(() => window.location.reload());
}
// Verifica se o usuário destinatário ainda está online
function verificaDestinatarioOnline(resposta) {
  let usersOnline = ["Todos"];
  const texto = document.querySelector(".message-input input");
  let textoMensagem = texto.value;
  let mensagem;
  mensagem = {from: nome, to: destinatario, text: textoMensagem, type: privacidade};
  texto.value = "";
  for (let i = 0; i < resposta.data.length; i++){
    usersOnline.push(resposta.data[i].name);
  }
  let elemento = usersOnline.find(elemento => elemento.toLowerCase().trim() === destinatario.toLowerCase().trim());
  if (elemento !== undefined){    
    // Se o destinatário estiver online faz a requisição para enviar a mensagem para o servidor
    let promessa = axios.post('https://mock-api.driven.com.br/api/v6/uol/messages', mensagem);
    promessa.then(carregarMensagens);
    promessa.catch(erroMensagem); 
  }  
  else {
    // Se o usuário estiver offline atualiza a página
    window.location.reload();
  }
}
function erroMensagem(resposta){
  let botao = document.querySelector(".login-Button");
  if (resposta.response.status === 400){
    document.querySelector(".login-screen input").value = "";
    botao.classList.remove("habilitado");
    botao.disabled = true;
    window.location.reload();
  }  
  window.location.reload();
}
