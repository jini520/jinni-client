package site.jejinni.server.repository.project;

import org.springframework.data.jpa.repository.JpaRepository;
import site.jejinni.server.domain.entity.project.Project;
import site.jejinni.server.domain.entity.project.ProjectContent;

import java.util.List;
import java.util.UUID;

public interface ProjectContentRepository extends JpaRepository<ProjectContent, UUID> {

	List<ProjectContent> findByProjectOrderByOrderAsc(Project project);

	List<ProjectContent> findByProjectIdAndParentIsNullOrderByOrderAsc(UUID projectId);

	List<ProjectContent> findByProjectIdOrderByOrderAsc(UUID projectId);
}

