import conectarBancoDeDados from '../../config/db.js';
import bcrypt from 'bcryptjs';

class Login {
    constructor(pLog) {
        this.id = (pLog.id !== null || pLog.id > 0) ? pLog.id : null;
        this.perfil = pLog.perfil;
        this.login = pLog.login;
        this.senha = pLog.senha;
        this.id_pessoa = (pLog.id_pessoa !== null || pLog.id_pessoa > 0) ? pLog.id_pessoa : null;
    }
    get Id() { return this.id; }
    set Id(value) { this.id = value; }

    get Perfil() { return this.perfil; }
    set Perfil(value) { this.perfil = value; }

    get Login() { return this.login; }
    set Login(value) { this.login = value; }

    get Senha() { return this.senha; }
    set Senha(value) { this.senha = value; }

    get Id_pessoa() { return this.id_pessoa; }
    set Id_pessoa(value) { this.id_pessoa = value; }

    // Método para validar os campos do login antes de registrar
    validarCampos() {
        return (
            this.perfil &&
            this.login &&
            this.senha
        );
    };






    // Método para criar um novo registro de login no banco de dados
    novoRegistroLogin = async (idPessoa) => {
        const con = await conectarBancoDeDados();
        try {
            const hashedPassword = await bcrypt.hash(this.senha, 10);
            const login = await con.query(`insert into tbl_login (perfil, login, senha, id_pessoa) values (?,?,?,?)`,
                [this.perfil, this.login, hashedPassword, idPessoa]);
            return login[0].insertId;
        } catch (error) {
            throw new Error(`Erro ao registrar: ${error.message}`);
        } finally {
            con.release();
        }
    };





    // Método para selecionar o registro de login com base no ID de uma pessoa
    static selectRegistroLogin = async (idPessoa) => {
        const con = await conectarBancoDeDados()
        try {
            const [rows] = await con.query(`select * from tbl_login where id_pessoa=?`,
                [idPessoa]);
            return rows;
        } catch (error) {
            throw new Error(`Erro ao selecionar: ${error.message}`);
        }
    };







    // static deleteRegistroLog = async (idLogin) => {
    //     const con = await conectarBancoDeDados();
    //     try {
    //         const person = await con.query(`delete from tbl_login where id_pessoa = ?`,
    //             [idLogin]);
    //         return person;
    //     } catch (error) {
    //         throw new Error(`Erro ao registrar: ${error.message}`);
    //     }
    // };





    // Método para selecionar um usuário com base no login fornecido
    static selecionarUsuarioPorLogin = async (login) => {
        const con = await conectarBancoDeDados();
        try {
            const [rows] = await con.query(`select * from tbl_login where login=?`, [login]);
            return rows;
        } catch (error) {
            throw new Error(`Erro ao selecionar: ${error.message}`);
        }
    };
}

export default Login;