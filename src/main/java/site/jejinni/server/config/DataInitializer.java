package site.jejinni.server.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import site.jejinni.server.domain.entity.project.Project;
import site.jejinni.server.domain.entity.project.ProjectContent;
import site.jejinni.server.repository.project.ProjectContentRepository;
import site.jejinni.server.repository.project.ProjectRepository;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
@Profile("test")
public class DataInitializer implements CommandLineRunner {

  private final ProjectRepository projectRepository;
  private final ProjectContentRepository projectContentRepository;

  @Override
  @Transactional
  public void run(String... args) {
    if (projectRepository.count() > 0) {
      log.info("데이터가 이미 존재합니다. 초기화를 건너뜁니다.");
      return;
    }

    log.info("Tooliv 프로젝트 데이터를 생성합니다...");

    // Tooliv 프로젝트 생성
    Project tooliv = Project.builder()
        .title("Tooliv")
        .description(
            "삼성청년SW아카데미 교육과정 프로젝트 진행 중 mattermost, webEx, kakaotalk 등 다양한 커뮤니케이션 툴을 사용하면서 발생하는 불편함을 개선하고자 프로젝트 기획")
        .skills(
            new String[] { "react", "nextjs", "javascript", "typescript", "recoil", "styled-components", "electron" })
        .participants(6)
        .period("2022.04 - 2022.05")
        .build();
    tooliv = projectRepository.save(tooliv);

    // 컨텐츠 생성
    ProjectContent content1 = ProjectContent.builder()
        .project(tooliv)
        .parent(null)
        .children(new UUID[0])
        .order(1)
        .content("프로젝트 구조 설계 및 디자인 시스템 적용")
        .build();
    content1 = projectContentRepository.save(content1);

    ProjectContent content2 = ProjectContent.builder()
        .project(tooliv)
        .parent(null)
        .children(new UUID[0])
        .order(2)
        .content("openVidu 라이브러리 활용 화상 미팅 및 화면 공유 기능 구현")
        .build();
    content2 = projectContentRepository.save(content2);

    ProjectContent content3 = ProjectContent.builder()
        .project(tooliv)
        .parent(null)
        .children(new UUID[0])
        .order(3)
        .content("Electron js 라이브러리 활용 Windows app 크로스플랫폼 구현")
        .build();
    content3 = projectContentRepository.save(content3);

    ProjectContent content4 = ProjectContent.builder()
        .project(tooliv)
        .parent(null)
        .children(new UUID[0])
        .order(4)
        .content("Windows app build 및 ms store 배포")
        .build();
    content4 = projectContentRepository.save(content4);

    ProjectContent content5 = ProjectContent.builder()
        .project(tooliv)
        .parent(null)
        .children(new UUID[0])
        .order(5)
        .content("서비스 소개 랜딩페이지 개발")
        .build();
    content5 = projectContentRepository.save(content5);

    log.info("Tooliv 프로젝트 데이터 생성 완료!");
    log.info("프로젝트 ID: {}", tooliv.getId());
  }
}
