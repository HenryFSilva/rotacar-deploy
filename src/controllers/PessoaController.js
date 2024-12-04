import Pessoa from "../models/Classes/PessoaClass.js";
import Telefone from "../models/Classes/TelefoneClass.js";
import Endereco from '../models/Classes/EnderecoClass.js';
import Login from "../models/Classes/LoginClass.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';



const pessoaControllers = {
  // Função para registrar um novo administrador ou outro tipo de usuário
  registroDeAdm: async (req, res) => {
    try {
      // Desestruturação dos dados recebidos no corpo da requisição (req.body)
      const { nome, cpf, email, tipo, logradouro, bairro, estado, numero, complemento, cep, telefone, senha } = req.body;
      const tipoUsuario = tipo ? tipo : 'CLI';

      // Validações para CPF, Email e CEP
      if (!Pessoa.validarCPF(cpf)) {
        return res.status(400).json({ message: 'CPF inválido. Deve conter 11 dígitos e ser um CPF existente.' });
      }

      if (!Pessoa.validarEmail(email)) {
        return res.status(400).json({ message: 'E-mail inválido. Por favor, insira um e-mail válido.' });
      }

      if (!Endereco.validarCEP(cep)) {
        return res.status(400).json({ message: 'CEP inválido. Deve conter exatamente 8 dígitos.' });
      }

      // Verifica se o usuário tentando cadastrar outro ADM tem permissões (apenas administradores podem cadastrar outros administradores)
      if (tipoUsuario === 'ADM') {
        console.log("tipo de usuário sendo cadastrado é ADM")
        if (req.user && req.user.perfil !== 'ADM') {
          return res.status(403).json({ message: 'Apenas administradores logados podem registrar outros administradores.' });
        }
      }

      if (tipoUsuario === 'MEC') {
        console.log("tipo de usuário sendo cadastrado é Mecanico")
        if (!req.user || req.user.perfil !== 'ADM') {
          console.log("usuário tentando criar mecanico não é adm")
          return res.status(403).json({ message: 'Apenas administradores logados podem registrar mecânicos.' });
        }
      }

      // Verifica se o tipo de usuário é válido (ADM, MEC ou CLI)
      if (!['ADM', 'MEC', 'CLI'].includes(tipoUsuario)) {
        return res.status(400).json({ message: 'Tipo de usuário inválido. Permitido apenas ADM, MEC ou CLI.' });
      }

      // Criação dos objetos Pessoa, Endereco, Telefone e Login com os dados fornecidos
      const personObj = new Pessoa({ id: null, nome, cpf, email, tipo: tipoUsuario });
      const enderecoObj = new Endereco({ id: null, logradouro, bairro, estado, numero, complemento, cep });
      const telefoneObj = new Telefone({ id: null, telefone });
      // Valida o telefone
      if (!telefoneObj.validarCampos()) {
        return res.status(400).json({ message: 'Telefone inválido. Deve conter exatamente 11 dígitos.' });
      }
      const loginObj = new Login({ id: null, perfil: tipoUsuario, login: email, senha });

      // Verifica se todos os campos obrigatórios são válidos
      if (!personObj.validarCampos() || !enderecoObj.validarCampos() || !telefoneObj.validarCampos() || !loginObj.validarCampos()) {
        return res.status(400).json({ message: 'O arquivo informado possui informações faltantes.' });
      }

      // Verifica se o CPF já está registrado
      if (await Pessoa.verificarCPFExistente(cpf)) {
        return res.status(400).json({ message: 'CPF já cadastrado.' });
      }

      // Registra a pessoa
      const idPessoa = await personObj.novoRegistroPessoa();
      if (idPessoa != null && idPessoa > 0) {
        const insertIdEnd = await enderecoObj.novoRegistroEnd(idPessoa);
        if (!insertIdEnd) {
          await personObj.deleteRegistroPessoa(idPessoa);

          return res.status(500).json({ message: 'Erro ao registrar o usuário.' });
        }

        const insertIdTel = await telefoneObj.novoRegistroTel(idPessoa);
        if (!insertIdTel) {
          await personObj.deleteRegistroPessoa(idPessoa);
          await enderecoObj.deleteRegistroEnd(insertIdEnd);
          return res.status(500).json({ message: 'Erro ao registrar o usuário.' });
        }

        const insertIdLog = await loginObj.novoRegistroLogin(idPessoa);
        if (!insertIdLog) {
          await personObj.deleteRegistroPessoa(idPessoa);
          await telefoneObj.deleteRegistroTel(insertIdTel);
          await enderecoObj.deleteRegistroEnd(insertIdEnd);
          return res.status(500).json({ message: 'Erro ao registrar o usuário.' });
        }

        return res.status(201).json({ message: 'Usuário registrado com sucesso.' });
      } else {
        return res.status(500).json({ message: 'Erro ao registrar o usuário.' });
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: `Erro ao registrar o usuário, motivo: ${e.message}` });
    }
  },

  // Função para selecionar todos os mecânicos cadastrados
  selecionarMecanicos: async (req, res) => {
    try {
      const mecanicos = await Pessoa.selecionarMecanicos();

      if (mecanicos.length > 0) {
        return res.json({
          message: 'Mecânicos encontrados',
          mecanicos
        });
      } else {
        return res.json({ message: 'Nenhum mecânico encontrado' });
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: `Erro ao buscar mecânicos, motivo: ${e.message}` });
    }
  },





  // Função para selecionar todos os usuários cadastrados
  selecionarTodosUsuario: async (req, res) => {
    try {
      const result = await Pessoa.selecionarTodosRegistros();

      if (result.length > 0) {
        return res.json({
          selectMessage: `Usuários localizados`,
          result
        });
      } else {
        return res.json({ selectMessage: `Usuários não foram encontrados` });
      }
    } catch (e) {
      console.error(e);
      return res.json({ selectMessage: `Usuários não foram localizados, motivo: ${e.message}` });
    }
  },




  // Função para selecionar um usuário pelo e-mail
  selecionarUsuarioPorEmail: async (req, res) => {
    try {
      const email = req.params.email;
      console.log(`Buscando usuário com e-mail: ${email}`);

      const result = await Pessoa.selectRegistroPessoaPorEmail(email);

      if (result.length > 0) {
        return res.json({
          selectMessage: `Usuário localizado`,
          person: result[0]
        });
      } else {
        return res.json({ selectMessage: `Usuário não encontrado` });
      }
    } catch (e) {
      console.error(e);
      return res.json({ selectMessage: `Usuário não foi localizado, motivo: ${e.message}` });
    }
  },


  // Função para selecionar um usuário pelo ID
  selecionarUsuarioId: async (req, res) => {
    try {
      const id = req.params.id;
      console.log(`Buscando usuário com ID: ${id}`);

      const result = await Pessoa.selectRegistroIdPessoa(id);

      if (result.length > 0) {
        return res.json({
          selectMessage: `Usuário localizado`,
          result
        });
      } else {
        return res.json({ selectMessage: `Usuário não encontrado` });
      }
    } catch (e) {
      console.error(e);
      return res.json({ selectMessage: `Usuário não foi localizado, motivo: ${e.message}` });
    }
  },






  // Função para editar um usuário (atualizar informações)
  editarUsuario: async (req, res) => {
    try {
      const id = req.params.id;
      const { nome, cpf, email, logradouro, bairro, estado, numero, complemento, cep, telefone } = req.body;

      if (!Pessoa.validarCPF(cpf)) {
        return res.status(400).json({ message: 'CPF inválido. Deve conter 11 dígitos e ser um CPF existente.' });
      }

      if (!Pessoa.validarEmail(email)) {
        return res.status(400).json({ message: 'E-mail inválido. Por favor, insira um e-mail válido.' });
      }

      if (!Endereco.validarCEP(cep)) {
        return res.status(400).json({ message: 'CEP inválido. Deve conter exatamente 8 dígitos.' });
      }

      // const tipoUsuario = tipo ? tipo : 'CLI';
      // if (!['ADM', 'MEC', 'CLI'].includes(tipoUsuario)) {
      //   return res.status(400).json({ message: 'Tipo de usuário inválido. Permitido apenas ADM, MEC ou CLI.' });
      // }

      const cpfExistente = await Pessoa.verificarCPFExistente(cpf, id);
      if (cpfExistente) {
        return res.status(400).json({ message: 'CPF já cadastrado.' });
      }

      const pessoa = new Pessoa({ id, nome, cpf, email });
      await pessoa.atualizarRegistroPessoa();

      const endereco = new Endereco({ id, logradouro, bairro, estado, numero, complemento, cep });
      await endereco.atualizarRegistroEnd();

      const telefoneObj = new Telefone({ id, telefone });
      if (!telefoneObj.validarCampos()) {
        return res.status(400).json({ message: 'Telefone inválido. Deve conter exatamente 11 dígitos.' });
      }
      await telefoneObj.atualizarRegistroTel();

      return res.json({ message: 'Usuário atualizado com sucesso.' });
    } catch (e) {
      console.error(e);
      return res.status(400).json({ message: `Erro ao atualizar usuário, motivo: ${e.message}` });
    }
  },








  // Função para fazer o login do usuário e gerar um token JWT
  loginUsuario: async (req, res) => {
    try {
      const { login, senha } = req.body;

      const usuario = await Pessoa.selectRegistroPessoaPorEmail(login);
      if (!usuario || usuario.length === 0) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      const senhaValida = await bcrypt.compare(senha, usuario[0].senha);
      if (!senhaValida) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      dotenv.config();

      const token = jwt.sign({
        id: usuario[0].id_pessoa,
        perfil: usuario[0].perfil
      }, process.env.JWT_SECRET, { expiresIn: '2h' });

      return res.json({
        token,
        tipo: usuario[0].perfil,
        id: usuario[0].pessoa_id,
        nome: usuario[0].nome
      });
    } catch (e) {
      console.error(e);
      return res.status(400).json({ message: 'Erro ao fazer login' });
    }
  }





};

export default pessoaControllers;