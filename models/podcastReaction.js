module.exports = (Sequelize, DataTypes) => {
    const podcastReaction = Sequelize.define("podcastReaction", {
        podcast_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        member_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        guest_id: {
            type: DataTypes.STRING,
            allowNull: true
        },
        reaction: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    }, {
        tableName: "podcast_reactions",
        timestamps: false,
    });

    podcastReaction.associate = (models) => {
        podcastReaction.belongsTo(models.Podcast, { foreignKey: "podcast_id" });
        podcastReaction.belongsTo(models.Members, { foreignKey: "member_id" });
    };

    return podcastReaction;
};