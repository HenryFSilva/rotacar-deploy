import conectarBancoDeDados from '../config/db.js'
import classAgendamento from '../models/Classes/AgendamentoClass.js'

const agendamentoController = {
    // Função para registrar um novo agendamento
    async registroDeAgendamento(req, res) {
        const { data_e_hora, observacao, idVeiOs, idPessoaVeiOs, idOS } = req.body;

        // Validação de campos obrigatórios
        if (!data_e_hora || !observacao || !idVeiOs || !idPessoaVeiOs) {
            return res.status(400).json({ message: 'Campos obrigatórios faltando. "data_e_hora", "observacao", "idVeiOs" e "idPessoaVeiOs" são obrigatórios.' });
        }

        try {
            // Se idOS foi fornecido no corpo da requisição, faz a validação dele
            if (idOS) {
                const [pessoaExists] = await classAgendamento.verificaSeClienteOsVeiculoExiste(idOS);
                if (!pessoaExists[0]['COUNT(*)']) {  // Verifique se o retorno é 0 (não existe)
                    return res.status(404).json({ message: 'ID da Ordem de Serviço (idOS) não encontrado ou inválido.' });
                }
            }

            // Criação do objeto de agendamento
            const agendamento = new classAgendamento({ data_e_hora, observacao });

            // Passamos idOS, idVeiOs e idPessoaVeiOs diretamente, podendo ser nulos se não fornecidos
            await agendamento.novoRegistroAgendamento(idOS || null, idVeiOs, idPessoaVeiOs);

            return res.status(201).json({ message: 'Agendamento registrado com sucesso!' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao registrar agendamento. Por favor, tente novamente.' });
        }
    },






    // Função para listar todos os agendamentos
    async listarAgendamentos(req, res) {
        try {
            const result = await classAgendamento.selectAgendamentos();
            if (result.length === 0) {
                return;
            }
            // Formata a data para o formato brasileiro
            for (let i = 0; i < result.length; i++) {
                const newDate = new Date(result[i].Data_e_hora);
                const dataBr = newDate.toLocaleString("pt-BR");
                result[i].Data_e_hora = dataBr;
            }
            return res.json({ result });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: 'Erro ao buscar agendamentos. Por favor, tente novamente.'
            });
        }
    },





    // Função para buscar agendamentos de uma pessoa específica
    async buscarAgendamentoPorPessoa(req, res) {
        const { idPessoa } = req.params;
        if (!idPessoa) {
            return res.status(400).json({ message: 'ID da Pessoa é obrigatório.' });
        }
        try {
            const [rows] = await classAgendamento.selectAgendamentosPorPessoa(idPessoa);
            for (let i = 0; i < rows.length; i++) {
                const newDate = new Date(rows[i].Data_e_hora);
                const dataBr = newDate.toLocaleString("pt-BR")
                rows[i].Data_e_hora = dataBr;
            }
            return res.json(rows);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao buscar agendamentos. Por favor, tente novamente.' });
        }
    },


    // Função para editar um agendamento existente
    async editarAgendamento(req, res) {
        const idAge = req.params.id;
        const { data_e_hora, observacao, id_os } = req.body;

        console.log('data_e_hora recebida:', data_e_hora);

        if (!data_e_hora || !observacao ) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }

        const agendamento = new classAgendamento({
            data_e_hora: data_e_hora,
            id: idAge,
            observacao,
            id_os
        });

        try {
            await agendamento.atualizarRegistroAgendamento();
            return res.json({ message: 'Agendamento atualizado com sucesso!' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: `Erro ao atualizar agendamento: ${error.message}` });
        }
    }









    // Função de exclusão de agendamento
    // async deletarAgendamento(req, res) {
    //     const idAge = req.params.id;
    //     try {
    //         const resultado = await classAgendamento.deleteRegistroAgendamento(idAge);
    //         if (resultado.affectedRows === 0) {
    //             return res.status(404).json({ message: 'Agendamento não encontrado.' });
    //         }
    //         return res.json({ message: 'Agendamento deletado com sucesso!' });
    //     } catch (error) {
    //         console.error(error);
    //         return res.status(500).json({ message: `Erro ao deletar agendamento: ${error.message}` });
    //     }
    // }


}

export default agendamentoController;