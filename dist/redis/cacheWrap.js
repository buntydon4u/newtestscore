import crypto from 'crypto';
export const cacheGet = async (_key) => {
    return null;
};
export const cacheSet = async (_key, _data, _ttl) => {
};
export const cacheDelete = async (_key) => {
};
export const cacheDeletePattern = async (_pattern) => {
};
export const cacheWrap = async (_key, _ttl, fetchFunction) => {
    return fetchFunction();
};
export const hashFilters = (obj) => {
    return crypto.createHash('md5').update(JSON.stringify(obj)).digest('hex');
};
export const cacheMasterData = async (_key, fetchFunction) => {
    return fetchFunction();
};
export const cacheExam = async (_key, fetchFunction) => {
    return fetchFunction();
};
export const cacheDashboard = async (_key, fetchFunction) => {
    return fetchFunction();
};
export const cacheList = async (_entity, _filters, fetchFunction) => {
    return fetchFunction();
};
//# sourceMappingURL=cacheWrap.js.map