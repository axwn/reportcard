FROM denoland/deno:1.18.2

EXPOSE 8080/tcp

RUN ["mkdir", "/reportcard"]
RUN ["chown", "deno", "/reportcard"]
WORKDIR /reportcard

USER deno

COPY src src
RUN ["deno", "cache", "src/main.ts"]

CMD ["deno", "run", "--allow-all", "src/main.ts"]
