FROM node:18

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm install

# 复制 Prisma Schema 并生成 Client
COPY prisma ./prisma/
RUN npx prisma generate

# 复制代码
COPY . .

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]
