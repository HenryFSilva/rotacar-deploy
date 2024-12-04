import conectarBancoDeDados from '../../config/db.js';

class Pessoa {
  constructor(pPes) {
    this.id = (pPes.id !== null || pPes.id > 0) ? pPes.id : null;
    this.nome = pPes.nome;
    this.cpf = pPes.cpf;
    this.email = pPes.email;
    this.tipo = pPes.tipo || null;
  }
  get Id() { return this.id; }
  set Id(value) { this.id = value; }

  get Nome() { return this.nome; }
  set Nome(value) { this.nome = value; }

  get Cpf() { return this.cpf; }
  set Cpf(value) { this.cpf = value; }

  get Email() { return this.email; }
  set Email(value) { this.email = value; }

  get Tipo() { return this.tipo; }
  set Tipo(value) { this.tipo = value; }

  // Método para validar se os campos obrigatórios da pessoa estão preenchidos
  validarCampos() {
    return (
      this.nome &&
      this.cpf &&
      this.email &&
      (this.tipo !== undefined || this.tipo === null)
    );
  };

  // Método para validar o CPF
  static validarCPF(cpf) {
    if (cpf.length !== 11) return false;

    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;
    let peso = 10;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf[i]) * peso--;
    }
    let digito1 = 11 - (soma % 11);
    if (digito1 === 10 || digito1 === 11) digito1 = 0;

    soma = 0;
    peso = 11;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf[i]) * peso--;
    }
    let digito2 = 11 - (soma % 11);
    if (digito2 === 10 || digito2 === 11) digito2 = 0;

    if (cpf[9] != digito1 || cpf[10] != digito2) return false;

    return true;
  };

  // Método  para verificar se o CPF já existe no banco de dados
  static verificarCPFExistente = async (cpf, idAtual = null) => {
    const con = await conectarBancoDeDados();
    try {
      const query = `SELECT COUNT(*) as count FROM tbl_pessoa WHERE cpf = ?${idAtual ? ' AND id != ?' : ''}`;
      const values = [cpf];
      if (idAtual) values.push(idAtual);

      const [rows] = await con.query(query, values);
      return rows[0].count > 0;
    } catch (error) {
      throw new Error(`Erro ao verificar CPF: ${error.message}`);
    } finally {
      con.release();
    }
  };


  // Método para validar o formato de um email
  static validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }





  // Método para registrar uma nova pessoa no banco de dados
  novoRegistroPessoa = async () => {
    const con = await conectarBancoDeDados();
    try {
      const query = `INSERT INTO tbl_pessoa (nome, cpf, email${this.tipo ? ', tipo' : ''}) VALUES (?, ?, ?${this.tipo ? ', ?' : ''})`;
      const values = [this.nome, this.cpf, this.email];
      if (this.tipo) values.push(this.tipo);
      const person = await con.query(query, values);
      return person[0].insertId;
    } catch (error) {
      throw new Error(`Erro ao registrar: ${error.message}`);
    } finally {
      con.release();
    }
  };


  // Método para selecionar todos os registros de pessoas, incluindo seus dados de endereço e telefone
  static selecionarTodosRegistros = async () => {
    const con = await conectarBancoDeDados();
    try {
      const query = `SELECT       
          p.id AS pessoa_id, 
          p.nome, 
          p.tipo,
          p.cpf, 
          p.email,
          e.logradouro, 
          e.bairro, 
          e.estado, 
          e.numero, 
          e.complemento, 
          e.cep,
          t.telefone
        FROM tbl_pessoa p
        INNER JOIN tbl_endereco AS e ON p.id = e.id_pessoa
        INNER JOIN tbl_telefone AS t ON p.id = t.id_pessoa
          `;
      const [rows] = await con.query(query);
      return rows;
    } catch (error) {
      throw new Error(`Erro ao selecionar: ${error.message}`);
    } finally {
      await con.release();
    }
  };






  // Método para selecionar uma pessoa pelo ID, com seus dados de endereço e telefone
  static selectRegistroIdPessoa = async (id) => {
    const con = await conectarBancoDeDados();
    try {
      const query = `
            SELECT 
              p.id AS pessoa_id, 
              p.nome, 
              p.cpf, 
              p.email,
              e.logradouro, 
              e.bairro, 
              e.estado, 
              e.numero, 
              e.complemento, 
              e.cep,
              t.telefone
            FROM tbl_pessoa p
            INNER JOIN tbl_endereco e ON p.id = e.id_pessoa
            INNER JOIN tbl_telefone t ON p.id = t.id_pessoa
            WHERE p.id = ?;
          `;
      const [rows] = await con.query(query, [id]);
      return rows;
    } catch (error) {
      throw new Error(`Erro ao selecionar: ${error.message}`);
    } finally {
      await con.release();
    }
  };







  // Método para selecionar uma pessoa pelo email, incluindo seus dados de login
  static selectRegistroPessoaPorEmail = async (email) => {
    const con = await conectarBancoDeDados();
    try {
      const query = `
            SELECT 
              p.id AS pessoa_id, 
              p.nome, 
              p.cpf, 
              p.email, 
              p.tipo,
              e.logradouro, 
              e.bairro, 
              e.estado, 
              e.numero, 
              e.complemento, 
              e.cep,
              t.telefone,
              l.perfil,
              l.login,
              l.senha
            FROM tbl_pessoa p
            INNER JOIN tbl_endereco e ON p.id = e.id_pessoa
            INNER JOIN tbl_telefone t ON p.id = t.id_pessoa
            INNER JOIN tbl_login l ON p.id = l.id_pessoa
            WHERE p.email = ?;
          `;
      const [rows] = await con.query(query, [email]);
      return rows;
    } catch (error) {
      throw new Error(`Erro ao selecionar: ${error.message}`);
    } finally {
      await con.release();
    }
  };





  //Atualiza os dados de uma pessoa no banco de dados.
  atualizarRegistroPessoa = async () => {
    const con = await conectarBancoDeDados();
    try {
      const query = `UPDATE tbl_pessoa SET nome = ?, cpf = ?, email = ?${this.tipo ? ', tipo = ?' : ''} WHERE id = ?`;
      const values = [this.nome, this.cpf, this.email];
      if (this.tipo) values.push(this.tipo);
      values.push(this.id);

      await con.query(query, values);
    } catch (error) {
      throw new Error(`Erro ao atualizar: ${error.message}`);
    }
  };







  //(Comentado) Exclui um registro de pessoa do banco de dados.
  // deleteRegistroPessoa = async (idPessoa) => {
  //     const con = await conectarBancoDeDados();
  //     try {
  //         const person = await con.query(`delete from tbl_pessoa where id=?`,
  //             [idPessoa]);
  //         return person;
  //     } catch (error) {
  //         throw new Error(`Erro ao registrar: ${error.message}`);
  //     }
  // };
}

export default Pessoa;


