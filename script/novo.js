let botaoAtivo = document.querySelector(".login-Button");
let inputAtivo = document.querySelector(".login-screen input");
const mensagemErro = document.querySelector(".error");
let nome; 
let usuarios = ["Todos"];
let privacidade = "message";
let destinatario = "Todos";
let textoPrivacidade ="";
let listaMensagens = [];

configuraTextoPrivacidade();

// Se a tecla ENTER for clicada na página de login entra na sala do chat
// Se a tecla ENTER for clicada na sala do chat envia a mensagem
document.addEventListener("keypress", clicaEnter);

function clicaEnter(tecla){
  if(tecla.key === 'Enter' && inputAtivo.value.length !== 0) {   
    botaoAtivo.click();  
  }
} 
function resetInput (elemento){
  elemento.style.backgroundColor = "white";
}
// Ativa o botão quando o usuário entra com o nome para fazer login
function ativarBotao(input){
  const botao = document.querySelector(".login-Button");  
  if (input.value.length >= 1){
    botao.style.backgroundColor = "#9dbd6a";
    botao.style.color = "White";
    botao.classList.add("habilitado");
    botao.removeAttribute("disabled");
  }
  else {
    botao.style.backgroundColor = "#E7E7E7";
    botao.style.color = "#696969";
    botao.classList.remove("habilitado");
    botao.disabled = true;
  }
}
function logar(){
  nome = document.querySelector(".login-screen input").value;
  let usuario = {name: nome};
  const loading = document.querySelector(".loading");
  loading.classList.remove("hidden");
  botaoAtivo = document.querySelector(".botaoEnviar");
  inputAtivo = document.querySelector(".message-input input");
  setTimeout(function(){document.querySelector(".loading").classList.add("hidden");}, 2000);
  const promessa = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', usuario);
  promessa.then(entrarNaSala);
  promessa.catch(erroLogin);
}
function entrarNaSala(resposta){
  document.querySelector("footer input").value = "";
  mensagemErro.classList.add("hidden");
  document.querySelector(".login-screen").classList.add("hidden");
  botaoAtivo = document.querySelector(".botaoEnviar");
  inputAtivo = document.querySelector(".message-input input");
  setInterval(carregarMensagens, 3000);
  setInterval(manterConexao, 5000);
  setInterval(carregarParticipantes, 10000);
  carregarMensagens();
  carregarParticipantes();
}
function carregarMensagens(){
  const promesssa = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
  promesssa.then(pegouMensagens); 
  promesssa.catch(erro);
}
function exibirMensagens(){
  console.log("LISTA DE MENSAGENS: " + listaMensagens);
  const chat = document.querySelector(".chat");
  let mensagem;
  chat.innerHTML = "";  
  for (let i = 0; i < listaMensagens.length; i++){
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
  chat.innerHTML = chat.innerHTML + `<div class="final"> </div>`;
  document.querySelector(".final").scrollIntoView(false);
}
function manterConexao(){
  let usuario = {name: nome};
  const promessa = axios.post('https://mock-api.driven.com.br/api/v6/uol/status', usuario);
  promessa.catch(() => window.location.reload());
  //promessa.then(taOn);
  //promessa.catch(taOff);
}
function erroLogin(erro){
  if (erro.response.status === 400){
    document.querySelector(".login-screen input").style.backgroundColor = "rgb(255, 216, 216)";
    mensagemErro.innerHTML = `O nome ${nome} já está em uso! <br> Por favor digite outro nome`;
    mensagemErro.classList.remove("hidden");
    botaoAtivo = document.querySelector(".login-Button");
    inputAtivo = document.querySelector(".login-screen input");
  }
}
function abrirSidebar(){
  document.querySelector(".titulo").scrollIntoView(true);
  document.querySelector(".users-list").classList.remove("hidden");
}
function fecharSidebar(){
  document.querySelector(".users-list").classList.add("hidden");
}
function carregarParticipantes (){
  const promessa = axios.get('https://mock-api.driven.com.br/api/v6/uol/participants');
  promessa.then(verificarUsuarios);
}
function verificarUsuarios(resposta){
  const listaUsuariosServidor = resposta.data;
  const listaNomes = [];
  let jaExiste;
  let userOnline;

  for (let i = 0; i < listaUsuariosServidor.length; i++){
    listaNomes.push(listaUsuariosServidor[i].name);
    jaExiste = usuarios.find(elemento => elemento.toLowerCase() === listaUsuariosServidor[i].name.toLowerCase());
    if (jaExiste === undefined){
      usuarios.push(listaUsuariosServidor[i].name);
    }
  }

  // Remover os elementos de usuários que não estão na lista atual de nome (listaNomes)
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
    let textoMensagem = document.querySelector('.message-input input');
    let msg = 
    {
        from: nome,
        to: destinatario,
        text: textoMensagem.value,
        type: privacidade
    }
    textoMensagem.value = "";
    const promessa = axios.post("https://mock-api.driven.com.br/api/v6/uol/messages", msg);
    promessa.then(enviouMensagem);
    promessa.catch(erroMensagem)
}
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
    let promessa = axios.post('https://mock-api.driven.com.br/api/v6/uol/messages', mensagem);
    promessa.then(carregarMensagens);
    promessa.catch(erroMensagem); 
  }  
  else {
    window.location.reload();
  }
}
function erroMensagem(resposta){
    comsole.log(resposta);
    window.location.reload();
  /* let botao = document.querySelector(".login-Button");
  if (resposta.response.status === 400){
    document.querySelector(".login-screen input").value = "";
    botao.classList.remove("habilitado");
    botao.disabled = true;
    window.location.reload();
  }  
  window.location.reload(); */
}
function erro(resposta){
    console.log(resposta);
}
function enviouMensagem(resposta){
    console.log(resposta);
    carregarMensagens();
}
function pegouMensagens(resposta){
    listaMensagens = resposta.data;
    console.log("LISTA DE MENSAGENS: " + listaMensagens);
    exibirMensagens();
}