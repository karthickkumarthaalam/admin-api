

module.exports = async (model, { page = 1, limit = 20, where = {}, order = [['createdAt', 'DESC']], include = [] }) => {

    try {
        const offset = (page - 1) * limit;

        const data = await model.findAndCountAll({
            where,
            include,
            order,
            offset,
            limit
        });

        const totalPages = Math.ceil(data.count / limit);

        return {
            data: data.rows,
            pagination: {
                totalRecords: data.count,
                totalPages,
                currentPage: page,
                perPage: limit,
            }
        };

    } catch (error) {
        throw new Error(error.message);
    }

};