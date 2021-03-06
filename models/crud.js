const orm = require('../orm/orm.js');
const read = require('./read');

module.exports = {
    createObject: async(entity, objectName) => {
        if (await entityExists(entity)) {
            const model = convertToOrmModel(entity);
            await orm[model].create({ name: objectName });
            return 200;
        } else {
            return 404;
        };
    },

    readObject: async(entity, objectId) => {
        if (await entityExists(entity)) {
            try {
                return await read[entity](objectId);
            } catch (e) {
                return 404;
            };
        } else {
            return 404;
        };
    },

    readAllEntityObjects: async(entity) => {
        if (await entityExists(entity)) {
            const entitySingular = entity.slice(0, -1);
            const model = entitySingular.charAt(0).toUpperCase() + entitySingular.slice(1);
            const objects = await orm[model].findAll();
            const objectsList = {
                [`${entity}`]: objects.map(object => { return `${object.name} (${object.id})` })
            };
            return objectsList;
        } else {
            return 404;
        };
    },

    updateObjectFields: async(entity, objectId, reqBody) => {
        if (await entityExists(entity)) {
            const entitySingular = entity.slice(0, -1);
            const model = entitySingular.charAt(0).toUpperCase() + entitySingular.slice(1);
            const object = await orm[model].find({ where: { id: objectId } });
            if (object) {
                let modelAttributes = [];
                for (let key in orm[model].rawAttributes) {
                    modelAttributes.push(key);
                };
                for (key in reqBody) {
                    if (!(modelAttributes.includes(key))) {
                        return 409;
                    };
                };
                for (key in reqBody) {
                    await object.update( { [key]: reqBody[key] } );
                };
                return 200;
            } else {
                return 404;
            };
        } else {
            return 404;
        };
    },

    addRelation: async(firstEntity, firstObjectId, secondEntity, secondObjectId) => {
        if (await entityExists(firstEntity) && (await entityExists(secondEntity))) {
            const firstModel = convertToOrmModel(firstEntity);
            const secondModel = convertToOrmModel(secondEntity);
            const firstObject = await orm[firstModel].find({ where: { id: firstObjectId } });
            const secondObject = await orm[secondModel].find({ where: { id: secondObjectId } });
            if (firstObject && secondObject) {
                try {
                    await firstObject[`add${secondModel}`](secondObject);
                } catch (e) {
                    await firstObject[`set${secondModel}`](secondObject);
                };
                return 200;
            } else {
                return 404;
            };
        } else {
            return 404;
        };
    },

    deleteRelation: async(firstEntity, firstObjectId, secondEntity, secondObjectId) => {
        if (await entityExists(firstEntity) && (await entityExists(secondEntity))) {
            const firstModel = convertToOrmModel(firstEntity);
            const secondModel = convertToOrmModel(secondEntity);
            const firstObject = await orm[firstModel].find({ where: { id: firstObjectId } });
            const secondObject = await orm[secondModel].find({ where: { id: secondObjectId } });
            if (firstObject && secondObject) {
                try {
                    await firstObject[`remove${secondModel}`](secondObject);
                } catch (e) {
                    await firstObject[`set${secondModel}`](null);
                };
                return 200;
            } else {
                return 404;
            };
        } else {
            return 404;
        };
    },

    deleteObject: async(entity, objectId) => {
        if (await entityExists(entity)) {
            const model = convertToOrmModel(entity);
            const entityFound = await orm[model].find({ where: { id: objectId } });
            if (entityFound) {
                await orm[model].destroy({ where: { id: objectId } });
                return 200;
            } else {
                return 409;
            };
        } else {
            return 404;
        };
    }
}

async function entityExists(entity) {
    const existingEntities = await orm.sequelize.query('SELECT name FROM sqlite_master WHERE type="table"');
    if (existingEntities.includes(entity)) {
        return true;
    } else {
        return false;
    };
};

function convertToOrmModel(entity) {
    const entitySingular = entity.slice(0, -1);
    const model = entitySingular.charAt(0).toUpperCase() + entitySingular.slice(1);
    return model;
};
