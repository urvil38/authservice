# PLEASE DO NOT EDIT 
# AUTOGENERATED WITH KUBEPAAS-GENERATOR

FROM nodejs:8-jessie
WORKDIR /app
ADD package.json .
RUN npm i
COPY . .
EXPOSE 8080
CMD [ "npm", "run","start" ]