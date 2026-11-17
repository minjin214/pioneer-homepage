#!/bin/sh
# MySQL(launchd 관리)을 잠깐 내렸다가 init-file로 한 번 띄워
# pioneer DB/계정을 만든 뒤, 다시 원래 launchd 방식으로 되돌린다.
# root 비밀번호는 바꾸지 않는다. 계정 비밀번호는 백엔드 설정 파일에서 읽는다.
# 사용법: sudo sh scripts/mysql-setup-macos.sh   (저장소 루트에서 실행, macOS + MySQL 공식 설치판 기준)
set -e
PLIST=/Library/LaunchDaemons/com.oracle.oss.mysql.mysqld.plist
INIT=/usr/local/mysql/data/pioneer-init.sql
PROPS="$(cd "$(dirname "$0")/.." && pwd)/backend/src/main/resources/application.properties"
DBPW="$(grep '^spring.datasource.password=' "$PROPS" | cut -d= -f2-)"
[ -n "$DBPW" ] || { echo "application.properties에서 DB 비밀번호를 찾지 못함"; exit 1; }

wait_no_mysqld() {
  i=0
  while pgrep -x mysqld >/dev/null; do
    i=$((i+1)); [ $i -gt 120 ] && { echo "mysqld가 종료되지 않음"; exit 1; }
    sleep 1
  done
}

echo "[1/5] 앞서 실패한 시작 시도 정리"
pkill -f 'mysqld_safe.*pioneer-init' 2>/dev/null || true
pkill -f 'mysqld .*--init-file' 2>/dev/null || true

echo "[2/5] 기존 MySQL(launchd) 정지"
launchctl bootout system "$PLIST" 2>/dev/null || true
wait_no_mysqld

echo "[3/5] init-file로 한 번 실행해서 DB/계정 생성"
umask 077
cat > "$INIT" <<SQL
CREATE DATABASE IF NOT EXISTS pioneer CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'pioneer'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DBPW';
CREATE USER IF NOT EXISTS 'pioneer'@'127.0.0.1' IDENTIFIED WITH mysql_native_password BY '$DBPW';
GRANT ALL PRIVILEGES ON pioneer.* TO 'pioneer'@'localhost';
GRANT ALL PRIVILEGES ON pioneer.* TO 'pioneer'@'127.0.0.1';
FLUSH PRIVILEGES;
SQL
chown _mysql:_mysql "$INIT"
/usr/local/mysql/bin/mysqld --user=_mysql --basedir=/usr/local/mysql \
  --datadir=/usr/local/mysql/data --plugin-dir=/usr/local/mysql/lib/plugin \
  --log-error=/usr/local/mysql/data/mysqld.local.err \
  --pid-file=/usr/local/mysql/data/mysqld.local.pid \
  --keyring-file-data=/usr/local/mysql/keyring/keyring \
  --early-plugin-load=keyring_file=keyring_file.so \
  --authentication_policy=mysql_native_password \
  --init-file="$INIT" &
i=0
until [ -S /tmp/mysql.sock ] && /usr/local/mysql/bin/mysqladmin --socket=/tmp/mysql.sock ping 2>&1 | grep -q -E 'alive|Access denied'; do
  i=$((i+1)); [ $i -gt 120 ] && { echo "시작 확인 실패: /usr/local/mysql/data/mysqld.local.err 확인 필요"; break; }
  sleep 1
done
sleep 2

echo "[4/5] 임시 실행 종료 및 init 파일 삭제"
pkill -TERM -x mysqld || true
wait_no_mysqld
rm -f "$INIT"

echo "[5/5] 원래 launchd 방식으로 다시 시작"
launchctl bootstrap system "$PLIST"
sleep 3
pgrep -x mysqld >/dev/null && echo PIONEER_DB_READY || echo "MySQL 재시작 확인 필요"
