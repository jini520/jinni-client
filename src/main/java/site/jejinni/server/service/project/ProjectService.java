package site.jejinni.server.service.project;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import site.jejinni.server.domain.entity.project.Project;
import site.jejinni.server.domain.entity.project.ProjectContent;
import site.jejinni.server.dto.common.ApiResponse;
import site.jejinni.server.dto.project.ProjectContentDto;
import site.jejinni.server.dto.project.ProjectDetailDto;
import site.jejinni.server.dto.project.ProjectListItemDto;
import site.jejinni.server.dto.project.ProjectListDto;
import site.jejinni.server.repository.project.ProjectContentRepository;
import site.jejinni.server.repository.project.ProjectRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {

	private final ProjectRepository projectRepository;
	private final ProjectContentRepository projectContentRepository;

	public ApiResponse<ProjectListDto> getProjectList(Pageable pageable) {
		Page<Project> projects = projectRepository.findAllByOrderByCreatedAtDesc(pageable);
		Page<ProjectListItemDto> dtoPage = projects.map(this::toListDto);

		ProjectListDto data = ProjectListDto.builder()
				.items(dtoPage.getContent())
				.totalPages(dtoPage.getTotalPages())
				.totalElements(dtoPage.getTotalElements())
				.size(dtoPage.getSize())
				.number(dtoPage.getNumber())
				.first(dtoPage.isFirst())
				.last(dtoPage.isLast())
				.build();

		return new ApiResponse<>(data);
	}

	public ApiResponse<ProjectDetailDto> getProjectDetail(UUID projectId) {
		Project project = projectRepository.findById(projectId)
				.orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + projectId));

		List<ProjectContent> contents = projectContentRepository.findByProjectIdOrderByOrderAsc(projectId);

		ProjectDetailDto data = ProjectDetailDto.builder()
				.id(project.getId())
				.title(project.getTitle())
				.description(project.getDescription())
				.skills(project.getSkills())
				.participants(project.getParticipants())
				.period(project.getPeriod())
				.contents(contents.stream()
						.map(this::toContentDto)
						.collect(Collectors.toList()))
				.build();

		return new ApiResponse<>(data);
	}

	private ProjectListItemDto toListDto(Project project) {
		return ProjectListItemDto.builder()
				.id(project.getId())
				.title(project.getTitle())
				.description(project.getDescription())
				.skills(project.getSkills())
				.period(project.getPeriod())
				.build();
	}

	private ProjectContentDto toContentDto(ProjectContent content) {
		return ProjectContentDto.builder()
				.id(content.getId())
				.parentId(content.getParent() != null ? content.getParent().getId() : null)
				.order(content.getOrder())
				.content(content.getContent())
				.children(content.getChildren() != null ? content.getChildren() : new UUID[0])
				.build();
	}
}
