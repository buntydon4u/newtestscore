export declare class ConfigService {
    getConfig(key: string): Promise<{
        key: string;
        value: import(".prisma/client/runtime/library.js").JsonValue;
        id: string;
        updatedAt: Date;
        isActive: boolean;
        category: string | null;
        description: string | null;
        updatedBy: string | null;
    }>;
    getAllConfigs(category?: string): Promise<{
        key: string;
        value: import(".prisma/client/runtime/library.js").JsonValue;
        id: string;
        updatedAt: Date;
        isActive: boolean;
        category: string | null;
        description: string | null;
        updatedBy: string | null;
    }[]>;
    setConfig(key: string, value: any, description?: string, category?: string): Promise<{
        key: string;
        value: import(".prisma/client/runtime/library.js").JsonValue;
        id: string;
        updatedAt: Date;
        isActive: boolean;
        category: string | null;
        description: string | null;
        updatedBy: string | null;
    }>;
    deleteConfig(key: string): Promise<{
        message: string;
    }>;
    toggleConfigStatus(key: string): Promise<{
        key: string;
        value: import(".prisma/client/runtime/library.js").JsonValue;
        id: string;
        updatedAt: Date;
        isActive: boolean;
        category: string | null;
        description: string | null;
        updatedBy: string | null;
    }>;
    getConfigsByCategory(category: string): Promise<{
        key: string;
        value: import(".prisma/client/runtime/library.js").JsonValue;
        id: string;
        updatedAt: Date;
        isActive: boolean;
        category: string | null;
        description: string | null;
        updatedBy: string | null;
    }[]>;
}
export declare const configService: ConfigService;
//# sourceMappingURL=config.service.d.ts.map