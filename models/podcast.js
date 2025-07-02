module.exports = (sequelize, DataTypes) => {
    const Podcast = sequelize.define('Podcast', {
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        rjname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        content: {
            type: DataTypes.STRING,
            allowNull: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
        },
        image_url: {
            type: DataTypes.STRING,
        },
        audio_drive_file_id: {
            type: DataTypes.STRING,
        },
        audio_drive_file_link: {
            type: DataTypes.STRING,
        },
        duration: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("active", "inactive"),
            defaultValue: "active",
        },
        language: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: '["All"]',
            get() {
                const value = this.getDataValue('language');
                return value ? JSON.parse(value) : [];
            },
            set(value) {
                if (Array.isArray(value)) {
                    this.setDataValue('language', JSON.stringify(value));
                } else if (typeof value === 'string' && value.startsWith('[')) {
                    try {
                        const arr = JSON.parse(value);
                        this.setDataValue('language', JSON.stringify(arr));
                    } catch (err) {
                        this.setDataValue('language', JSON.stringify(['All']));
                    }
                } else {
                    this.setDataValue('language', JSON.stringify(['All']));
                }
            }
        },
        tags: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: '[]',
            get() {
                const value = this.getDataValue('tags');
                return value ? JSON.parse(value) : [];
            },
            set(value) {
                if (Array.isArray(value)) {
                    this.setDataValue('tags', JSON.stringify(value));
                } else if (typeof value === 'string' && value.startsWith("[")) {
                    try {
                        const arr = JSON.parse(value);
                        this.setDataValue('tags', JSON.stringify(arr));
                    } catch (error) {
                        this.setDataValue('tags', JSON.stringify([]));
                    }
                } else {
                    this.setDataValue('tags', JSON.stringify([]));
                }
            }
        }
    }, {
        tableName: 'podcasts',
        timestamps: false,
    });

    Podcast.associate = (models) => {
        Podcast.hasMany(models.PodcastComment, { foreignKey: "podcast_id" });
        Podcast.hasMany(models.PodcastReaction, { foreignKey: "podcast_id" });
    };

    return Podcast;
};
