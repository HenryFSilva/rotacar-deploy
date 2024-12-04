import conectarBancoDeDados from '../../config/db.js';

class Produtos {
    constructor(pPro) {
        this.id = (pPro.id !== null || pPro.id > 0) ? pPro.id : null;
        this.nome_produto = pPro.nome_produto;
        this.marca_produto = pPro.marca_produto;
        this.valor_produto = pPro.valor_produto;
    }
    get Id() { return this.id; }
    set Id(value) { this.id = value; }

    get Nome_produto() { return this.nome_produto; }
    set Nome_produto(value) { this.nome_produto = value; }

    get Marca_produto() { return this.marca_produto; }
    set Marca_produto(value) { this.marca_produto = value; }

    get Valor_produto() { return this.valor_produto; }
    set Valor_produto(value) { this.valor_produto = value; }

    // Método para validar os campos do produto
    validarCampos() {
        const campos = {
            Nome_produto: this.nome_produto,
            Marca_produto: this.marca_produto,
            Valor_produto: this.valor_produto
        };
        for (const [key, value] of Object.entries(campos)) {
            if (!value || (key === 'valor_produto' && isNaN(value))) {
                throw new Error(`O campo ${key} é obrigatório e deve ser válido.`);
            }
        }
        return true;
    };





    // Método para registrar um novo produto no banco de dados
    novoRegistroPecas = async () => {
        const con = await conectarBancoDeDados();
        try {
            this.validarCampos();
            const result = await con.query(
                `INSERT INTO tbl_produtos (nome_produto, marca_produto, valor_produto) VALUES (?, ?, ?)`,
                [this.nome_produto, this.marca_produto, this.valor_produto]
            );
            return result[0].insertId;
        } catch (error) {
            throw new Error(`Erro ao registrar peça: ${error.message}`);
        }
    };






    // Método para selecionar todos os produtos do banco de dados
    static selecionarRegistroPecas = async () => {
        const con = await conectarBancoDeDados();
        try {
            const [rows] = await con.query(`SELECT * FROM tbl_produtos`);
            return rows;
        } catch (error) {
            throw new Error(`Erro ao selecionar: ${error.message}`);
        } finally {
            await con.release();
        }
    };






    // Método para selecionar um produto específico pelo ID
    static selecionarRegistroPecasPorId = async (idPro) => {
        const con = await conectarBancoDeDados();
        try {
            const [rows] = await con.query(`SELECT * FROM tbl_produtos WHERE id = ?`, [idPro]);
            return rows
        } catch (error) {
            throw new Error(`Erro ao selecionar: ${error.message}`);
        } finally {
            await con.release();
        }
    };






    // Método para atualizar as informações de um produto no banco de dados
    atualizarRegistroPecas = async (idPro) => {
        const con = await conectarBancoDeDados();
        try {
            this.validarCampos();
            await con.query(
                `UPDATE tbl_produtos SET nome_produto = ?, marca_produto = ?, valor_produto = ? WHERE id = ?`,
                [this.nome_produto, this.marca_produto, this.valor_produto, idPro]
            );
        } catch (error) {
            throw new Error(`Erro ao atualizar peça: ${error.message}`);
        }
    };







    // Método para excluir um produto do banco de dados pelo ID
    static deleteRegistroPecas = async (idPro) => {
        const con = await conectarBancoDeDados();
        try {
            const result = await con.query(`DELETE FROM tbl_produtos WHERE id = ?`, [idPro]);
            return result;
        } catch (error) {
            throw new Error(`Erro ao excluir peça: ${error.message}`);
        }
    };

}

export default Produtos;