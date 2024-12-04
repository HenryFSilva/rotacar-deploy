import conectarBancoDeDados from '../../config/db.js';

class ItemOs {
    constructor(pItem) {
        this.id = (pItem.id !== null || pItem.id > 0) ? pItem.id : null;
        this.id_produto = (pItem.id_produto !== null || pItem.id_produto > 0) ? pItem.id_produto : null;
        this.quantidade = pItem.quantidade;
        this.id_os = (pItem.id_os !== null || pItem.id_os > 0) ? pItem.id_os : null;
        this.id_veiculo_os = (pItem.id_veiculo_os !== null || pItem.id_veiculo_os > 0) ? pItem.id_veiculo_os : null;
        this.id_pessoa_veiculo_os = (pItem.id_pessoa_veiculo_os !== null || pItem.id_pessoa_veiculo_os > 0) ? pItem.id_pessoa_veiculo_os : null;
    }
    get Id_produto() { return this.id_produto; }
    set Id_produto(value) { this.id_produto = value; }

    get Quantidade() { return this.quantidade; }
    set Quantidade(value) { this.quantidade = value; }

    get Id_os() { return this.id_os; }
    set Id_os(value) { this.id_os = value; }

    get Id_veiculo_os() { return this.id_veiculo_os; }
    set Id_veiculo_os(value) { this.id_veiculo_os = value; }

    get Id_pessoa_veiculo_os() { return this.id_pessoa_veiculo_os; }
    set Id_pessoa_veiculo_os(value) { this.id_pessoa_veiculo_os = value; }

    // Método para validar os campos do item
    validarCampos() {
        const campos = {
            Quantidade: this.quantidade
        };
        for (const [key, value] of Object.entries(campos)) {
            if (!value || (key === 'quantidade' && isNaN(value))) {
                throw new Error(`O campo ${key} é obrigatório e deve ser válido.`);
            }
        }
        return true;
    };





    // Método para adicionar uma peça na Ordem de Serviço
    adicionarPecaOs = async (idOS, idVeiOs, idPessoaVeiOs, idPro) => {
        const con = await conectarBancoDeDados();
        try {
            this.validarCampos();
            const result = await con.query(
                `INSERT INTO tbl_itens_os (id_produto ,quantidade, id_os, id_veiculo_os, id_pessoa_veiculo_os) VALUES (?, ?, ?, ?, ?)`,
                [idPro, this.quantidade, idOS, idVeiOs, idPessoaVeiOs]
            );
            return result[0].insertId;
        } catch (error) {
            throw new Error(`Erro ao registrar peça: ${error.message}`);
        }
    };






    // Método para excluir um item da Ordem de Serviço
    static deletePecaOs = async (idItem) => {
        const con = await conectarBancoDeDados();
        try {
            const result = await con.query(`DELETE FROM tbl_itens_os WHERE id = ?`, [idItem]);
            return result;
        } catch (error) {
            throw new Error(`Erro ao excluir peça: ${error.message}`);
        }
    };

}

export default ItemOs;