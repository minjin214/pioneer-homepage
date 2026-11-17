package com.pioneer.pioneer_app.assignments;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * 과제 첨부 파일을 로컬 디스크(app.upload-dir/submissions)에 저장한다.
 * 저장 이름은 UUID로 만들어서, 사용자가 올린 파일 이름이 경로에 쓰이지 않게 한다.
 */
@Component
public class FileStorage {

    private final Path root;

    public FileStorage(@Value("${app.upload-dir}") String uploadDir) throws IOException {
        this.root = Path.of(uploadDir, "submissions").toAbsolutePath().normalize();
        Files.createDirectories(root);
    }

    /** 파일을 저장하고 저장된 이름을 돌려준다. */
    public String save(MultipartFile file) {
        String original = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        String ext = "";
        int dot = original.lastIndexOf('.');
        if (dot >= 0 && original.length() - dot <= 10) {
            ext = original.substring(dot).replaceAll("[^A-Za-z0-9.]", "");
        }
        String stored = UUID.randomUUID() + ext;
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, resolve(stored), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "파일 저장에 실패했습니다.");
        }
        return stored;
    }

    public Resource load(String storedName) {
        try {
            Resource r = new UrlResource(resolve(storedName).toUri());
            if (!r.exists()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "파일이 없습니다.");
            return r;
        } catch (MalformedURLException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "파일이 없습니다.");
        }
    }

    public void delete(String storedName) {
        if (storedName == null) return;
        try {
            Files.deleteIfExists(resolve(storedName));
        } catch (IOException ignored) {
            // 파일 삭제 실패는 제출 처리 자체를 막지 않음
        }
    }

    private Path resolve(String storedName) {
        Path p = root.resolve(storedName).normalize();
        if (!p.startsWith(root)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "잘못된 파일 경로입니다.");
        }
        return p;
    }
}
